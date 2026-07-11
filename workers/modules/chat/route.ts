import type { ChatRequest } from '@contracts/chat';
import { Hono } from 'hono';

import { jsonError } from '../../shared/response';
import { ChatServiceError, completeChat } from './service';

export const chatRoute = new Hono<{ Bindings: Cloudflare.Env }>();

chatRoute.post('/chat/completion', async (c) => {
  if (!c.env.DEEPSEEK_API_KEY) {
    return jsonError('缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置', 500);
  }

  const body = await c.req.json<ChatRequest>();
  const conversationId = body.conversation_id?.trim();
  const editedMessageId = body.message_id?.trim();
  const prompt = body.prompt?.trim();

  if (!conversationId) {
    return jsonError('会话 ID 不能为空');
  }

  if (!prompt && !editedMessageId) {
    return jsonError('消息不能为空');
  }

  if (prompt && editedMessageId) {
    return jsonError('不能同时发送新消息和编辑消息');
  }

  try {
    return await completeChat({
      env: c.env,
      conversationId,
      editedMessageId,
      prompt,
    });
  } catch (error) {
    if (error instanceof ChatServiceError) {
      return jsonError(error.message, error.status);
    }

    throw error;
  }
});
