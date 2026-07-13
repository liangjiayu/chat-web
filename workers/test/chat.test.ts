import { env } from 'cloudflare:workers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import app from '../app';
import {
  API_ORIGIN,
  apiRequest,
  cleanDatabase,
  json,
  jsonRequest,
  mockDeepSeek,
  seedConversation,
  seedMessage,
} from './helpers';

beforeEach(cleanDatabase);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('chat completion API', () => {
  // 验证 prompt 与 message_id 必须二选一，不能同时提供或同时缺失。
  it.each([
    { conversation_id: 'chat', prompt: '问题', message_id: 'id' },
    { conversation_id: 'chat' },
  ])('rejects invalid prompt and message ID combinations', async (body) => {
    const response = await apiRequest('/chat/completion', jsonRequest('POST', body));

    expect(response.status).toBe(400);
    expect((await json(response)).code).toBe(400);
  });

  // 验证缺少上游密钥时会在写入会话前终止请求。
  it('reports a missing DeepSeek API key before writing data', async () => {
    const response = await app.fetch(
      new Request(`${API_ORIGIN}/api/chat/completion`, {
        ...jsonRequest('POST', { conversation_id: 'missing-key', prompt: '问题' }),
      }),
      { ...env, DEEPSEEK_API_KEY: '' },
    );

    expect(response.status).toBe(500);
    expect(await json(response)).toEqual({
      error: '缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置',
      code: 500,
    });
    const conversation = await env.DB.prepare('SELECT id FROM conversations WHERE id = ?')
      .bind('missing-key')
      .first();
    expect(conversation).toBeNull();
  });

  // 验证新会话能完整消费 SSE、保存问答消息并更新生成的标题。
  it('streams a new conversation and persists both messages and its generated title', async () => {
    const fetchMock = mockDeepSeek('问候会话');

    const response = await apiRequest(
      '/chat/completion',
      jsonRequest('POST', { conversation_id: 'new-chat', prompt: '你好' }),
    );
    const stream = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    expect(stream).toContain('event: message\ndata: {"message":{"v":"你"}}');
    expect(stream).toContain('event: message\ndata: {"message":{"v":"好"}}');
    expect(stream).toContain('event: title\ndata: {"content":"问候会话"}');
    expect(stream).toContain('event: done');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const conversation = await env.DB.prepare('SELECT title FROM conversations WHERE id = ?')
      .bind('new-chat')
      .first<{ title: string }>();
    const messages = await env.DB.prepare(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at',
    )
      .bind('new-chat')
      .all<{ role: string; content: string }>();
    expect(conversation?.title).toBe('问候会话');
    expect(messages.results).toEqual([
      { role: 'user', content: '你好' },
      { role: 'assistant', content: '你好' },
    ]);
  });

  // 验证已有会话会把历史消息发给上游，且不会重复创建会话。
  it('sends existing history without creating another conversation', async () => {
    await seedConversation({ id: 'existing-chat', title: '已有会话' });
    await seedMessage({
      id: 'previous-user',
      conversationId: 'existing-chat',
      role: 'user',
      content: '上一问',
      createdAt: 1_000,
    });
    await seedMessage({
      id: 'previous-assistant',
      conversationId: 'existing-chat',
      role: 'assistant',
      content: '上一答',
      createdAt: 2_000,
    });
    const fetchMock = mockDeepSeek();

    const response = await apiRequest(
      '/chat/completion',
      jsonRequest('POST', { conversation_id: 'existing-chat', prompt: '继续' }),
    );
    await response.text();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = new Request(fetchMock.mock.calls[0][0], fetchMock.mock.calls[0][1]);
    const body = (await request.json()) as { messages: Array<{ content: string }> };
    expect(body.messages.map(({ content }) => content)).toEqual(['上一问', '上一答', '继续']);
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM conversations').first<{
      count: number;
    }>();
    expect(count?.count).toBe(1);
  });

  // 验证重新生成回复时复用已编辑消息，不重复写入用户消息。
  it('regenerates from an edited message without inserting another user message', async () => {
    await seedConversation({ id: 'regenerate' });
    await seedMessage({
      id: 'edited-user',
      conversationId: 'regenerate',
      role: 'user',
      content: '修改后的问题',
      createdAt: 1_000,
    });
    mockDeepSeek();

    const response = await apiRequest(
      '/chat/completion',
      jsonRequest('POST', { conversation_id: 'regenerate', message_id: 'edited-user' }),
    );
    await response.text();

    const messages = await env.DB.prepare(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at',
    )
      .bind('regenerate')
      .all<{ role: string; content: string }>();
    expect(messages.results).toEqual([
      { role: 'user', content: '修改后的问题' },
      { role: 'assistant', content: '你好' },
    ]);
  });

  // 验证上游 HTTP 失败会保留状态码和错误详情返回给客户端。
  it('returns the upstream failure without contacting the real service', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response('上游限流', { status: 429 }),
    );

    const response = await apiRequest(
      '/chat/completion',
      jsonRequest('POST', { conversation_id: 'failed-chat', prompt: '问题' }),
    );

    expect(response.status).toBe(429);
    expect(await json(response)).toEqual({ error: '上游限流', code: 429 });
  });

  // 验证无法解析的上游数据会转换为 SSE error 事件并正常关闭流。
  it('emits an SSE error when the upstream stream is invalid', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(
      async () =>
        new Response('data: {invalid}\n\n', {
          status: 200,
          headers: { 'Content-Type': 'text/event-stream' },
        }),
    );

    const response = await apiRequest(
      '/chat/completion',
      jsonRequest('POST', { conversation_id: 'invalid-stream', prompt: '问题' }),
    );
    const stream = await response.text();

    expect(response.status).toBe(200);
    expect(stream).toContain('event: error');
  });
});
