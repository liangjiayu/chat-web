import { createRoute, OpenAPIHono } from '@hono/zod-openapi';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

import { validationHook } from '../../openapi/validation';
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
import {
  ConversationServiceError,
  createNewConversation,
  deleteExistingConversation,
  editLastUserMessage,
  getConversationDetail,
  listConversations,
  renameExistingConversation,
} from './service';

export const conversationsRoute = new OpenAPIHono<{ Bindings: Cloudflare.Env }>({
  defaultHook: validationHook,
});

async function runService<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ConversationServiceError) {
      httpError(error.message, error.status as ContentfulStatusCode);
    }

    throw error;
  }
}

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

conversationsRoute.openapi(listRoute, async (c) => c.json(await listConversations(c.env.DB), 200));

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
  const conversation = await createNewConversation({ env: c.env, ...body });

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
  const conversation = await runService(() => renameExistingConversation(c.env.DB, id, title));

  return c.json(conversation, 200);
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
  await runService(() => deleteExistingConversation(c.env.DB, id));

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
  await runService(() => editLastUserMessage(c.env.DB, conversationId, messageId, content));

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
  const result = await runService(() => getConversationDetail(c.env.DB, id));

  return c.json(result, 200);
});
