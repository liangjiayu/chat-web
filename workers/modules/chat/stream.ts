import {
  touchConversation,
  updateConversationTitleIfCurrent,
} from '../../repositories/conversations';
import { createMessage } from '../../repositories/messages';

const encoder = new TextEncoder();

function sendEvent(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

export function createChatStream(input: {
  db: D1Database;
  upstream: Response;
  conversationId: string;
  model: string;
  isNewConversation: boolean;
  initialTitle: string;
  titlePromise: Promise<string | null>;
}) {
  return new Response(
    new ReadableStream({
      async start(controller) {
        const assistantMessageId = crypto.randomUUID();
        const decoder = new TextDecoder();
        const reader = input.upstream.body!.getReader();
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
                sendEvent(controller, 'message', { message: { v: delta } });
              }
            }
          }

          const doneAt = Date.now();
          await createMessage(input.db, {
            id: assistantMessageId,
            conversationId: input.conversationId,
            role: 'assistant',
            content: assistantContent,
            model: input.model,
            status: 'done',
            now: doneAt,
          });
          await touchConversation(input.db, input.conversationId, doneAt);

          if (input.isNewConversation) {
            const title = (await input.titlePromise) ?? input.initialTitle;

            if (title !== input.initialTitle) {
              await updateConversationTitleIfCurrent(input.db, {
                id: input.conversationId,
                title,
                currentTitle: input.initialTitle,
                now: Date.now(),
              });
            }

            sendEvent(controller, 'title', { content: title });
          }

          sendEvent(controller, 'done', {
            message: {
              id: assistantMessageId,
              metadata: {},
              created_at: doneAt,
              updated_at: doneAt,
            },
          });
        } catch (error) {
          sendEvent(controller, 'error', {
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
}
