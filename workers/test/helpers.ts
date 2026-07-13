import { env, exports } from 'cloudflare:workers';
import { expect, vi } from 'vitest';

import {
  DEEPSEEK_CHAT_COMPLETIONS_URL,
  DEFAULT_CONVERSATION_TITLE,
  DEFAULT_MODEL,
} from '../constants';

export const API_ORIGIN = 'http://example.com';

export type JsonRecord = Record<string, unknown>;

export function apiRequest(path: string, init?: RequestInit) {
  return exports.default.fetch(`${API_ORIGIN}/api${path}`, init);
}

export function jsonRequest(method: string, body: unknown) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  } satisfies RequestInit;
}

export async function seedConversation(input: {
  id: string;
  title?: string;
  createdAt?: number;
  updatedAt?: number;
}) {
  const createdAt = input.createdAt ?? 1_000;
  await env.DB.prepare(
    `INSERT INTO conversations
      (id, user_id, title, model, metadata, created_at, updated_at)
     VALUES (?, 'local-user', ?, ?, '{}', ?, ?)`,
  )
    .bind(
      input.id,
      input.title ?? DEFAULT_CONVERSATION_TITLE,
      DEFAULT_MODEL,
      createdAt,
      input.updatedAt ?? createdAt,
    )
    .run();
}

export async function seedMessage(input: {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}) {
  await env.DB.prepare(
    `INSERT INTO messages
      (id, conversation_id, role, content, model, status, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'done', '{}', ?, ?)`,
  )
    .bind(
      input.id,
      input.conversationId,
      input.role,
      input.content,
      DEFAULT_MODEL,
      input.createdAt,
      input.createdAt,
    )
    .run();
}

export async function json(response: Response) {
  return (await response.json()) as JsonRecord;
}

export async function cleanDatabase() {
  await env.DB.prepare('DELETE FROM messages').run();
  await env.DB.prepare('DELETE FROM conversations').run();
}

function deepSeekStream(...chunks: string[]) {
  const payload = chunks
    .map((content) => `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`)
    .join('');
  return new Response(`${payload}data: [DONE]\n\n`, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

export function mockDeepSeek(title = '测试标题') {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const request = new Request(input, init);
    expect(request.url).toBe(DEEPSEEK_CHAT_COMPLETIONS_URL);
    expect(request.headers.get('Authorization')).toBe('Bearer test-api-key');
    const body = (await request.json()) as { stream: boolean };

    if (body.stream) {
      return deepSeekStream('你', '好');
    }

    return Response.json({ choices: [{ message: { content: title } }] });
  });
}
