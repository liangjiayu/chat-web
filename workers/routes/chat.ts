import type { ChatRequest } from '@contracts/chat';
import { Hono } from 'hono';

import {
  DEEPSEEK_CHAT_COMPLETIONS_URL,
  DEFAULT_CONVERSATION_TITLE,
  DEFAULT_MODEL,
} from '../constants';
import {
  createConversation,
  getConversation,
  touchConversation,
  updateConversationTitleIfCurrent,
} from '../repositories/conversations';
import { createMessage, getMessageHistory } from '../repositories/messages';
import { makeTitleMessages, parseTitleContent } from '../utils/chat';
import { jsonError } from '../utils/response';
import { sse } from '../utils/sse';

export const chatRoute = new Hono<{ Bindings: Cloudflare.Env }>();

async function generateConversationTitle(input: { apiKey: string; model: string; prompt: string }) {
  const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: input.model,
      messages: makeTitleMessages(input.prompt),
      stream: false,
    }),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return parseTitleContent(data.choices?.[0]?.message?.content ?? '');
}

chatRoute.post('/chat/completion', async (c) => {
  if (!c.env.DEEPSEEK_API_KEY) {
    return jsonError('缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置', 500);
  }

  const body = await c.req.json<ChatRequest>();
  const conversationId = body.conversation_id?.trim();
  const prompt = body.prompt?.trim();

  if (!conversationId) {
    return jsonError('会话 ID 不能为空');
  }

  if (!prompt) {
    return jsonError('消息不能为空');
  }

  const now = Date.now();
  const model = c.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  let conversation = await getConversation(c.env.DB, conversationId);
  let isNewConversation = false;
  let initialTitle = conversation?.title ?? '';

  if (!conversation) {
    initialTitle = DEFAULT_CONVERSATION_TITLE;
    isNewConversation = true;
    conversation = await createConversation(c.env.DB, {
      id: conversationId,
      title: initialTitle,
      model,
      now,
    });
  }

  const userMessageId = crypto.randomUUID();
  await createMessage(c.env.DB, {
    id: userMessageId,
    conversationId,
    role: 'user',
    content: prompt,
    model,
    status: 'done',
    now,
  });
  await touchConversation(c.env.DB, conversationId, now);

  const history = await getMessageHistory(c.env.DB, conversationId);
  const upstream = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: history,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    return jsonError(detail || 'DeepSeek 请求失败', upstream.status || 502);
  }

  const titlePromise = isNewConversation
    ? generateConversationTitle({
        apiKey: c.env.DEEPSEEK_API_KEY,
        model,
        prompt,
      }).catch(() => null)
    : Promise.resolve(null);

  return new Response(
    new ReadableStream({
      async start(controller) {
        const assistantMessageId = crypto.randomUUID();
        const decoder = new TextDecoder();
        const reader = upstream.body!.getReader();
        let buffer = '';
        let assistantContent = '';

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) {
              break;
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
                sse(controller, 'message', { message: { v: delta } });
              }
            }
          }

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

          if (isNewConversation) {
            const title = (await titlePromise) ?? initialTitle;

            if (title !== initialTitle) {
              await updateConversationTitleIfCurrent(c.env.DB, {
                id: conversationId,
                title,
                currentTitle: initialTitle,
                now: Date.now(),
              });
            }

            sse(controller, 'title', { content: title });
          }

          sse(controller, 'done', {
            message: {
              id: assistantMessageId,
              metadata: {},
              created_at: doneAt,
              updated_at: doneAt,
            },
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
