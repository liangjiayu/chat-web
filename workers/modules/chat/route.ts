import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';

import { validationHook } from '../../openapi/validation';
import { httpError } from '../../shared/response';
import { ChatRequestSchema } from './schema';
import { completeChat } from './service';

export const chatRoute = new OpenAPIHono<{ Bindings: Cloudflare.Env }>({
  defaultHook: validationHook,
});

const completionRoute = createRoute({
  method: 'post',
  path: '/chat/completion',
  tags: ['Chat'],
  summary: '发起聊天补全',
  description: '返回 SSE 流，事件结构和调用流程参见 docs/server-api.md。',
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
    httpError('缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置', 500);
  }

  const body = c.req.valid('json');

  return completeChat({
    env: c.env,
    conversationId: body.conversation_id,
    editedMessageId: body.message_id,
    prompt: body.prompt,
  });
});
