import { createRoute, OpenAPIHono } from '@hono/zod-openapi';

import { DEFAULT_CONVERSATION_TITLE, DEFAULT_MODEL } from '../../constants';
import { validationHook } from '../../openapi/validation';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  renameConversation,
  touchConversation,
} from '../../repositories/conversations';
import {
  deleteAssistantMessagesAfter,
  getLastUserMessage,
  getMessage,
  getMessages,
  updateMessageContent,
} from '../../repositories/messages';
import { httpError } from '../../shared/response';
import {
  ConversationIdParamsSchema,
  ConversationListResponseSchema,
  ConversationMessagesResponseSchema,
  ConversationResponseSchema,
  CreateConversationRequestSchema,
  CreateConversationResponseSchema,
  DeleteConversationResponseSchema,
  EditMessageRequestSchema,
  EditMessageResponseSchema,
  MessageParamsSchema,
  RenameConversationRequestSchema,
} from './schema';

export const conversationsRoute = new OpenAPIHono<{ Bindings: Cloudflare.Env }>({
  defaultHook: validationHook,
});

const listRoute = createRoute({
  method: 'get',
  path: '/conversations',
  tags: ['Conversations'],
  summary: '获取会话列表',
  responses: {
    200: {
      description: '会话列表',
      content: { 'application/json': { schema: ConversationListResponseSchema } },
    },
  },
});

conversationsRoute.openapi(listRoute, async (c) => c.json(await getConversations(c.env.DB), 200));

const createRouteDefinition = createRoute({
  method: 'post',
  path: '/conversations',
  tags: ['Conversations'],
  summary: '创建空会话',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: CreateConversationRequestSchema } },
    },
  },
  responses: {
    200: {
      description: '创建成功',
      content: { 'application/json': { schema: CreateConversationResponseSchema } },
    },
  },
});

conversationsRoute.openapi(createRouteDefinition, async (c) => {
  const body = c.req.valid('json');
  const id = crypto.randomUUID();
  const now = Date.now();
  const title = body.title?.trim() || DEFAULT_CONVERSATION_TITLE;
  const model = body.model || c.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  const conversation = await createConversation(c.env.DB, { id, title, model, now });

  return c.json({ conversation }, 200);
});

const renameRoute = createRoute({
  method: 'patch',
  path: '/conversations/{id}',
  tags: ['Conversations'],
  summary: '重命名会话',
  request: {
    params: ConversationIdParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: RenameConversationRequestSchema } },
    },
  },
  responses: {
    200: {
      description: '重命名后的会话',
      content: { 'application/json': { schema: ConversationResponseSchema } },
    },
  },
});

conversationsRoute.openapi(renameRoute, async (c) => {
  const { id } = c.req.valid('param');
  const { title } = c.req.valid('json');
  const result = await renameConversation(c.env.DB, { id, title, now: Date.now() });

  if (!result.meta.changes) {
    httpError('会话不存在', 404);
  }

  return c.json((await getConversation(c.env.DB, id))!, 200);
});

const deleteRoute = createRoute({
  method: 'delete',
  path: '/conversations/{id}',
  tags: ['Conversations'],
  summary: '删除会话',
  request: { params: ConversationIdParamsSchema },
  responses: {
    200: {
      description: '删除成功',
      content: { 'application/json': { schema: DeleteConversationResponseSchema } },
    },
  },
});

conversationsRoute.openapi(deleteRoute, async (c) => {
  const { id } = c.req.valid('param');
  const result = await deleteConversation(c.env.DB, id, Date.now());

  if (!result.meta.changes) {
    httpError('会话不存在', 404);
  }

  return c.json({ success: true as const }, 200);
});

const editMessageRoute = createRoute({
  method: 'patch',
  path: '/conversations/{conversationId}/messages/{messageId}',
  tags: ['Messages'],
  summary: '编辑最后一条用户消息',
  request: {
    params: MessageParamsSchema,
    body: {
      required: true,
      content: { 'application/json': { schema: EditMessageRequestSchema } },
    },
  },
  responses: {
    200: {
      description: '编辑成功',
      content: { 'application/json': { schema: EditMessageResponseSchema } },
    },
  },
});

conversationsRoute.openapi(editMessageRoute, async (c) => {
  const { conversationId, messageId } = c.req.valid('param');
  const { content } = c.req.valid('json');
  const conversation = await getConversation(c.env.DB, conversationId);

  if (!conversation) {
    httpError('会话不存在', 404);
  }

  const message = await getMessage(c.env.DB, conversationId, messageId);

  if (!message) {
    httpError('消息不存在', 404);
  }

  if (message.role !== 'user') {
    httpError('只能编辑用户消息', 400);
  }

  const lastUserMessage = await getLastUserMessage(c.env.DB, conversationId);

  if (lastUserMessage?.id !== message.id) {
    httpError('只能编辑最后一条用户消息', 400);
  }

  const now = Date.now();
  await updateMessageContent(c.env.DB, { conversationId, id: message.id, content, now });
  await deleteAssistantMessagesAfter(c.env.DB, {
    conversationId,
    createdAt: message.created_at,
  });
  await touchConversation(c.env.DB, conversationId, now);

  return c.json({ success: true as const }, 200);
});

const detailRoute = createRoute({
  method: 'get',
  path: '/conversations/{id}',
  tags: ['Conversations'],
  summary: '获取会话详情和消息',
  request: { params: ConversationIdParamsSchema },
  responses: {
    200: {
      description: '会话详情和消息',
      content: { 'application/json': { schema: ConversationMessagesResponseSchema } },
    },
  },
});

conversationsRoute.openapi(detailRoute, async (c) => {
  const { id } = c.req.valid('param');
  const conversation = await getConversation(c.env.DB, id);

  if (!conversation) {
    httpError('会话不存在', 404);
  }

  return c.json({ conversation, messages: await getMessages(c.env.DB, id) }, 200);
});
