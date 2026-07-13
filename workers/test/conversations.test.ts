import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_CONVERSATION_TITLE } from '../constants';
import {
  apiRequest,
  cleanDatabase,
  json,
  jsonRequest,
  type JsonRecord,
  seedConversation,
  seedMessage,
} from './helpers';

beforeEach(cleanDatabase);

describe('conversation API', () => {
  // 验证创建接口会应用默认标题，并清理用户自定义标题两侧的空白。
  it('creates conversations with default and custom titles', async () => {
    const defaultResponse = await apiRequest('/conversations', jsonRequest('POST', {}));
    const customResponse = await apiRequest(
      '/conversations',
      jsonRequest('POST', { title: '  自定义标题  ' }),
    );

    expect(defaultResponse.status).toBe(200);
    expect(((await json(defaultResponse)).conversation as JsonRecord).title).toBe(
      DEFAULT_CONVERSATION_TITLE,
    );
    expect(((await json(customResponse)).conversation as JsonRecord).title).toBe('自定义标题');

    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM conversations').first<{
      count: number;
    }>();
    expect(count?.count).toBe(2);
  });

  // 验证列表只展示有效会话，并以最近更新时间倒序排列。
  it('lists active conversations by most recent update', async () => {
    await seedConversation({ id: 'older', title: '旧会话', updatedAt: 1_000 });
    await seedConversation({ id: 'newer', title: '新会话', updatedAt: 2_000 });
    await seedConversation({ id: 'deleted', title: '已删除', updatedAt: 3_000 });
    await env.DB.prepare('UPDATE conversations SET deleted_at = 3000 WHERE id = ?')
      .bind('deleted')
      .run();

    const response = await apiRequest('/conversations');
    const body = (await response.json()) as Array<JsonRecord>;

    expect(response.status).toBe(200);
    expect(body.map(({ id }) => id)).toEqual(['newer', 'older']);
  });

  // 验证详情接口返回目标会话，并按创建时间排列消息。
  it('returns conversation details with ordered messages', async () => {
    await seedConversation({ id: 'detail' });
    await seedMessage({
      id: 'second',
      conversationId: 'detail',
      role: 'assistant',
      content: '回答',
      createdAt: 2_000,
    });
    await seedMessage({
      id: 'first',
      conversationId: 'detail',
      role: 'user',
      content: '问题',
      createdAt: 1_000,
    });

    const response = await apiRequest('/conversations/detail');
    const body = await json(response);

    expect(response.status).toBe(200);
    expect((body.conversation as JsonRecord).id).toBe('detail');
    expect((body.messages as Array<JsonRecord>).map(({ id }) => id)).toEqual(['first', 'second']);
  });

  // 验证重命名和软删除形成完整链路，删除后会话不可再访问。
  it('renames and soft-deletes a conversation', async () => {
    await seedConversation({ id: 'mutable' });

    const renameResponse = await apiRequest(
      '/conversations/mutable',
      jsonRequest('PATCH', { title: '新标题' }),
    );
    expect(renameResponse.status).toBe(200);
    expect((await json(renameResponse)).title).toBe('新标题');

    const deleteResponse = await apiRequest('/conversations/mutable', { method: 'DELETE' });
    expect(deleteResponse.status).toBe(200);
    expect(await json(deleteResponse)).toEqual({ success: true });

    const detailResponse = await apiRequest('/conversations/mutable');
    expect(detailResponse.status).toBe(404);
    expect(await json(detailResponse)).toEqual({ error: '会话不存在', code: 404 });
  });

  // 验证修改或删除不存在的会话时返回明确的 404 业务错误。
  it('returns 404 when mutating a missing conversation', async () => {
    const renameResponse = await apiRequest(
      '/conversations/missing',
      jsonRequest('PATCH', { title: '新标题' }),
    );
    const deleteResponse = await apiRequest('/conversations/missing', { method: 'DELETE' });

    expect(renameResponse.status).toBe(404);
    expect(await json(renameResponse)).toEqual({ error: '会话不存在', code: 404 });
    expect(deleteResponse.status).toBe(404);
    expect(await json(deleteResponse)).toEqual({ error: '会话不存在', code: 404 });
  });

  // 验证 Hono 能拦截损坏的 JSON 请求体，不进入业务处理。
  it('returns Hono malformed JSON response', async () => {
    const response = await apiRequest('/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    });

    expect(response.status).toBe(400);
    expect(await response.text()).toBe('Malformed JSON in request body');
  });

  // 验证重命名接口拒绝只有空白字符的标题。
  it('rejects a blank conversation title', async () => {
    const response = await apiRequest(
      '/conversations/missing',
      jsonRequest('PATCH', { title: '   ' }),
    );

    expect(response.status).toBe(400);
    expect((await json(response)).code).toBe(400);
  });
});
