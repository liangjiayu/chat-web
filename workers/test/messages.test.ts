import { env } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';

import {
  apiRequest,
  cleanDatabase,
  json,
  jsonRequest,
  seedConversation,
  seedMessage,
} from './helpers';

beforeEach(cleanDatabase);

describe('message edit API', () => {
  // 验证编辑最后一条用户消息后，会清除基于旧内容生成的助手回复。
  it('edits the last user message and removes later assistant messages', async () => {
    await seedConversation({ id: 'editing' });
    await seedMessage({
      id: 'user-message',
      conversationId: 'editing',
      role: 'user',
      content: '旧内容',
      createdAt: 1_000,
    });
    await seedMessage({
      id: 'assistant-message',
      conversationId: 'editing',
      role: 'assistant',
      content: '旧回答',
      createdAt: 2_000,
    });

    const response = await apiRequest(
      '/conversations/editing/messages/user-message',
      jsonRequest('PATCH', { content: '新内容' }),
    );

    expect(response.status).toBe(200);
    expect(await json(response)).toEqual({ success: true });
    const messages = await env.DB.prepare(
      'SELECT id, content FROM messages WHERE conversation_id = ? ORDER BY created_at',
    )
      .bind('editing')
      .all<{ id: string; content: string }>();
    expect(messages.results).toEqual([{ id: 'user-message', content: '新内容' }]);
  });

  // 验证消息角色、编辑顺序和消息归属约束会返回对应业务错误。
  it('rejects assistant, non-last, and missing messages', async () => {
    await seedConversation({ id: 'invalid-edit' });
    await seedMessage({
      id: 'old-user',
      conversationId: 'invalid-edit',
      role: 'user',
      content: '旧问题',
      createdAt: 1_000,
    });
    await seedMessage({
      id: 'assistant',
      conversationId: 'invalid-edit',
      role: 'assistant',
      content: '回答',
      createdAt: 2_000,
    });
    await seedMessage({
      id: 'last-user',
      conversationId: 'invalid-edit',
      role: 'user',
      content: '新问题',
      createdAt: 3_000,
    });

    const assistantResponse = await apiRequest(
      '/conversations/invalid-edit/messages/assistant',
      jsonRequest('PATCH', { content: '修改' }),
    );
    const oldUserResponse = await apiRequest(
      '/conversations/invalid-edit/messages/old-user',
      jsonRequest('PATCH', { content: '修改' }),
    );
    const missingResponse = await apiRequest(
      '/conversations/invalid-edit/messages/missing',
      jsonRequest('PATCH', { content: '修改' }),
    );

    expect(await json(assistantResponse)).toEqual({ error: '只能编辑用户消息', code: 400 });
    expect(await json(oldUserResponse)).toEqual({ error: '只能编辑最后一条用户消息', code: 400 });
    expect(await json(missingResponse)).toEqual({ error: '消息不存在', code: 404 });
  });

  // 验证编辑接口拒绝空消息内容。
  it('rejects blank message content', async () => {
    const response = await apiRequest(
      '/conversations/missing/messages/message',
      jsonRequest('PATCH', { content: '' }),
    );

    expect(response.status).toBe(400);
    expect((await json(response)).code).toBe(400);
  });
});
