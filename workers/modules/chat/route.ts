import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { validationHook } from '../../openapi/validation';
import { BusinessError } from '../../shared/errors';
import { ChatRequestSchema } from './schema';
import { completeChat } from './service';

export const chatRoute = new OpenAPIHono<{ Bindings: Cloudflare.Env }>({
  defaultHook: validationHook,
});

const completionRoute = createRoute({
  method: 'post',
  path: '/chat/completion',
  operationId: 'createChatCompletion',
  tags: ['Chat'],
  summary: '发起聊天补全',
  description: '通过 SSE 流式返回聊天消息增量和处理结果。',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: ChatRequestSchema } },
    },
  },
  responses: {
    200: {
      description: '聊天补全 SSE 流',
      content: { 'text/event-stream': { schema: z.string() } },
    },
  },
});

chatRoute.openapi(completionRoute, async (c) => {
  if (!c.env.DEEPSEEK_API_KEY) {
    throw new BusinessError('缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置', 500);
  }

  const body = c.req.valid('json');

  return completeChat({
    env: c.env,
    conversationId: body.conversation_id,
    editedMessageId: body.message_id,
    prompt: body.prompt,
  });
});
