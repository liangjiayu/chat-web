import { Hono } from 'hono';

import { DEFAULT_MODEL } from '../constants';
import type {
  CreateConversationRequest,
  RenameConversationRequest,
} from '../contracts/conversations';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  renameConversation,
} from '../repositories/conversations';
import { getMessages } from '../repositories/messages';
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
  const title = body.title?.trim() || '新对话';
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

conversationsRoute.get('/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const conversation = await getConversation(c.env.DB, id);

  if (!conversation) {
    return jsonError('会话不存在', 404);
  }

  return c.json({ conversation, messages: await getMessages(c.env.DB, id) });
});
