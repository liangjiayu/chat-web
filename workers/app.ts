import { Hono } from 'hono';
import { createRequestHandler } from 'react-router';

type Bindings = {
  DB: D1Database;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  VALUE_FROM_CLOUDFLARE?: string;
};

type ConversationRow = {
  id: string;
  title: string;
  model: string;
  metadata: string;
  created_at: number;
  updated_at: number;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  status: string;
  metadata: string;
  created_at: number;
  updated_at: number;
};

type Metadata = Record<string, unknown>;

type Conversation = Omit<ConversationRow, 'metadata'> & {
  metadata: Metadata;
};

type Message = Omit<MessageRow, 'metadata'> & {
  metadata: Metadata;
};

const app = new Hono<{ Bindings: Bindings }>();
const LOCAL_USER_ID = 'local-user';
const DEFAULT_MODEL = 'deepseek-v4-flash';

function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function makeTitle(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  return normalized.length > 28 ? `${normalized.slice(0, 28)}...` : normalized || '新对话';
}

function sse(controller: ReadableStreamDefaultController, event: string, data: unknown) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

function parseMetadata(value: string | null): Metadata {
  if (!value) {
    return {};
  }

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Metadata)
      : {};
  } catch {
    return {};
  }
}

function toConversation(row: ConversationRow): Conversation {
  return {
    ...row,
    metadata: parseMetadata(row.metadata),
  };
}

function toMessage(row: MessageRow): Message {
  return {
    ...row,
    metadata: parseMetadata(row.metadata),
  };
}

async function getConversation(db: D1Database, id: string) {
  const row = await db
    .prepare(
      'SELECT id, title, model, metadata, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
    )
    .bind(id, LOCAL_USER_ID)
    .first<ConversationRow>();

  return row ? toConversation(row) : null;
}

app.get('/api/conversations', async (c) => {
  const rows = await c.env.DB.prepare(
    'SELECT id, title, model, metadata, created_at, updated_at FROM conversations WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
  )
    .bind(LOCAL_USER_ID)
    .all<ConversationRow>();

  return c.json({ conversations: (rows.results ?? []).map(toConversation) });
});

app.post('/api/conversations', async (c) => {
  const body = (await c.req.json<{ title?: string; model?: string }>().catch(() => ({}))) as {
    title?: string;
    model?: string;
  };
  const id = crypto.randomUUID();
  const now = Date.now();
  const title = body.title?.trim() || '新对话';
  const model = body.model || c.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

  await c.env.DB.prepare(
    'INSERT INTO conversations (id, user_id, title, model, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(id, LOCAL_USER_ID, title, model, '{}', now, now)
    .run();

  return c.json({
    conversation: { id, title, model, metadata: {}, created_at: now, updated_at: now },
  });
});

app.patch('/api/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const body = (await c.req.json<{ title?: string }>().catch(() => ({}))) as {
    title?: string;
  };
  const title = body.title?.trim();

  if (!title) {
    return jsonError('会话标题不能为空');
  }

  const result = await c.env.DB.prepare(
    'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
  )
    .bind(title, Date.now(), id, LOCAL_USER_ID)
    .run();

  if (!result.meta.changes) {
    return jsonError('会话不存在', 404);
  }

  return c.json({ conversation: await getConversation(c.env.DB, id) });
});

app.delete('/api/conversations/:id', async (c) => {
  const id = c.req.param('id');
  const now = Date.now();
  const result = await c.env.DB.prepare(
    'UPDATE conversations SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
  )
    .bind(now, now, id, LOCAL_USER_ID)
    .run();

  if (!result.meta.changes) {
    return jsonError('会话不存在', 404);
  }

  return c.json({ ok: true });
});

app.get('/api/conversations/:id/messages', async (c) => {
  const id = c.req.param('id');
  const conversation = await getConversation(c.env.DB, id);

  if (!conversation) {
    return jsonError('会话不存在', 404);
  }

  const rows = await c.env.DB.prepare(
    'SELECT id, conversation_id, role, content, model, status, metadata, created_at, updated_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
  )
    .bind(id)
    .all<MessageRow>();

  return c.json({ conversation, messages: (rows.results ?? []).map(toMessage) });
});

app.post('/api/chat', async (c) => {
  if (!c.env.DEEPSEEK_API_KEY) {
    return jsonError('缺少 DEEPSEEK_API_KEY，请在 .dev.vars 或 Wrangler secret 中配置', 500);
  }

  const body = await c.req.json<{ conversationId?: string; content?: string }>().catch(() => null);
  const content = body?.content?.trim();

  if (!content) {
    return jsonError('消息不能为空');
  }

  const now = Date.now();
  const model = c.env.DEEPSEEK_MODEL || DEFAULT_MODEL;
  let conversationId = body?.conversationId;
  let conversation = conversationId ? await getConversation(c.env.DB, conversationId) : null;

  if (!conversation) {
    conversationId = crypto.randomUUID();
    await c.env.DB.prepare(
      'INSERT INTO conversations (id, user_id, title, model, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(conversationId, LOCAL_USER_ID, makeTitle(content), model, '{}', now, now)
      .run();
    conversation = await getConversation(c.env.DB, conversationId);
  }

  if (!conversation || !conversationId) {
    return jsonError('无法创建会话', 500);
  }

  const userMessageId = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO messages (id, conversation_id, role, content, model, status, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
  )
    .bind(userMessageId, conversationId, 'user', content, model, 'done', '{}', now, now)
    .run();

  await c.env.DB.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?')
    .bind(now, conversationId)
    .run();

  const history = await c.env.DB.prepare(
    'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 40',
  )
    .bind(conversationId)
    .all<{ role: 'user' | 'assistant' | 'system'; content: string }>();

  const upstream = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${c.env.DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: history.results ?? [{ role: 'user', content }],
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
          userMessage: {
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
                sse(controller, 'delta', { content: delta });
              }
            }
          }

          const doneAt = Date.now();
          await c.env.DB.prepare(
            'INSERT INTO messages (id, conversation_id, role, content, model, status, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          )
            .bind(
              assistantMessageId,
              conversationId,
              'assistant',
              assistantContent,
              model,
              'done',
              '{}',
              doneAt,
              doneAt,
            )
            .run();
          await c.env.DB.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?')
            .bind(doneAt, conversationId)
            .run();

          sse(controller, 'done', {
            messageId: assistantMessageId,
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

app.get('*', (c) => {
  const requestHandler = createRequestHandler(
    () => import('virtual:react-router/server-build'),
    import.meta.env.MODE,
  );

  return requestHandler(c.req.raw, {
    cloudflare: { env: c.env, ctx: c.executionCtx },
  });
});

export default app;
