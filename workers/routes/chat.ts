import { Hono } from 'hono';

import { DEFAULT_MODEL } from '../constants';
import type { ChatRequest } from '../contracts/chat';
import {
  createConversation,
  getConversation,
  touchConversation,
} from '../repositories/conversations';
import { createMessage, getMessageHistory } from '../repositories/messages';
import { makeTitle } from '../utils/chat';
import { jsonError } from '../utils/response';
import { sse } from '../utils/sse';

export const chatRoute = new Hono<{ Bindings: Cloudflare.Env }>();

chatRoute.post('/chat/completion', async (c) => {
  if (!c.env.DEEPSEEK_API_KEY) {
    return jsonError('缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置', 500);
  }

  const body = await c.req.json<ChatRequest>().catch(() => null);
  const content = body?.content?.trim();

  if (!content) {
    return jsonError('消息不能为空');
  }

  const now = Date.now();
  const model = c.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  let conversationId = body?.conversation_id;
  let conversation = conversationId ? await getConversation(c.env.DB, conversationId) : null;

  if (!conversation) {
    conversationId = crypto.randomUUID();
    conversation = await createConversation(c.env.DB, {
      id: conversationId,
      title: makeTitle(content),
      model,
      now,
    });
  }

  if (!conversation || !conversationId) {
    return jsonError('无法创建会话', 500);
  }

  const userMessageId = crypto.randomUUID();
  await createMessage(c.env.DB, {
    id: userMessageId,
    conversationId,
    role: 'user',
    content,
    model,
    status: 'done',
    now,
  });
  await touchConversation(c.env.DB, conversationId, now);

  const history = await getMessageHistory(c.env.DB, conversationId);
  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: history ?? [{ role: 'user', content }],
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    return jsonError(detail || 'DeepSeek 请求失败', upstream.status || 502);
  }

  return new Response(
    new ReadableStream({
      async start(controller) {
        const assistantMessageId = crypto.randomUUID();
        const decoder = new TextDecoder();
        const reader = upstream.body!.getReader();
        let buffer = '';
        let assistantContent = '';

        sse(controller, 'meta', {
          conversation,
          user_message: {
            id: userMessageId,
            conversation_id: conversationId,
            role: 'user',
            content,
            model,
            status: 'done',
            metadata: {},
            created_at: now,
            updated_at: now,
          },
        });

        try {
          const readNextChunk = async (): Promise<void> => {
            const { value, done } = await reader.read();
            if (done) {
              return;
            }

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) {
                continue;
              }

              const payload = trimmed.slice(5).trim();
              if (!payload || payload === '[DONE]') {
                continue;
              }

              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = parsed.choices?.[0]?.delta?.content;

              if (delta) {
                assistantContent += delta;
                sse(controller, 'delta', { content: delta });
              }
            }

            await readNextChunk();
          };

          await readNextChunk();

          const doneAt = Date.now();
          await createMessage(c.env.DB, {
            id: assistantMessageId,
            conversationId,
            role: 'assistant',
            content: assistantContent,
            model,
            status: 'done',
            now: doneAt,
          });
          await touchConversation(c.env.DB, conversationId, doneAt);

          sse(controller, 'done', {
            message_id: assistantMessageId,
            content: assistantContent,
            metadata: {},
            created_at: doneAt,
            updated_at: doneAt,
          });
        } catch (error) {
          sse(controller, 'error', {
            message: error instanceof Error ? error.message : '流式响应解析失败',
          });
        } finally {
          controller.close();
        }
      },
    }),
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream; charset=utf-8',
        Connection: 'keep-alive',
      },
    },
  );
});
