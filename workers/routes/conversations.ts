import type {
  CreateConversationRequest,
  EditMessageRequest,
  RenameConversationRequest,
} from '@contracts/conversations';
import { Hono } from 'hono';

import { DEFAULT_CONVERSATION_TITLE, DEFAULT_MODEL } from '../constants';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  renameConversation,
  touchConversation,
} from '../repositories/conversations';
import {
  deleteAssistantMessagesAfter,
  getLastUserMessage,
  getMessage,
  getMessages,
  updateMessageContent,
} from '../repositories/messages';
import { jsonError } from '../utils/response';

export const conversationsRoute = new Hono<{ Bindings: Cloudflare.Env }>();

conversationsRoute.get('/conversations', async (c) => {
  const conversations = await getConversations(c.env.DB);

  return c.json(conversations);
});

conversationsRoute.post('/conversations', async (c) => {
  const body = await c.req.json<CreateConversationRequest>();
  const id = crypto.randomUUID();
  const now = Date.now();
  const title = body.title?.trim() || DEFAULT_CONVERSATION_TITLE;
  const model = body.model || c.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const conversation = await createConversation(c.env.DB, { id, title, model, now });

  return c.json({ conversation });
});

conversationsRoute.patch('/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<RenameConversationRequest>();
  const title = body.title?.trim();

  if (!title) {
    return jsonError('会话标题不能为空');
  }

  const result = await renameConversation(c.env.DB, { id, title, now: Date.now() });

  if (!result.meta.changes) {
    return jsonError('会话不存在', 404);
  }

  return c.json(await getConversation(c.env.DB, id));
});

conversationsRoute.delete('/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const result = await deleteConversation(c.env.DB, id, Date.now());

  if (!result.meta.changes) {
    return jsonError('会话不存在', 404);
  }

  return c.json({ success: true });
});

conversationsRoute.patch('/conversations/:conversationId/messages/:messageId', async (c) => {
  const conversationId = c.req.param('conversationId');
  const messageId = c.req.param('messageId');
  const body = await c.req.json<EditMessageRequest>();
  const content = body.content?.trim();

  if (!content) {
    return jsonError('消息不能为空');
  }

  const conversation = await getConversation(c.env.DB, conversationId);

  if (!conversation) {
    return jsonError('会话不存在', 404);
  }

  const message = await getMessage(c.env.DB, conversationId, messageId);

  if (!message) {
    return jsonError('消息不存在', 404);
  }

  if (message.role !== 'user') {
    return jsonError('只能编辑用户消息');
  }

  const lastUserMessage = await getLastUserMessage(c.env.DB, conversationId);

  if (lastUserMessage?.id !== message.id) {
    return jsonError('只能编辑最后一条用户消息');
  }

  const now = Date.now();
  await updateMessageContent(c.env.DB, {
    conversationId,
    id: message.id,
    content,
    now,
  });
  await deleteAssistantMessagesAfter(c.env.DB, {
    conversationId,
    createdAt: message.created_at,
  });
  await touchConversation(c.env.DB, conversationId, now);

  return c.json({ success: true });
});

conversationsRoute.get('/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const conversation = await getConversation(c.env.DB, id);

  if (!conversation) {
    return jsonError('会话不存在', 404);
  }

  return c.json({ conversation, messages: await getMessages(c.env.DB, id) });
});
