import type { MessageHistoryRow, MessageRow } from '../types';
import { toMessage } from '../utils/chat';

export async function getMessages(db: D1Database, conversationId: string) {
  const rows = await db
    .prepare(
      'SELECT id, conversation_id, role, content, model, status, metadata, created_at, updated_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    )
    .bind(conversationId)
    .all<MessageRow>();

  return (rows.results ?? []).map(toMessage);
}

export async function createMessage(
  db: D1Database,
  input: {
    id: string;
    conversationId: string;
    role: MessageRow['role'];
    content: string;
    model: string | null;
    status: string;
    now: number;
  },
) {
  await db
    .prepare(
      'INSERT INTO messages (id, conversation_id, role, content, model, status, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(
      input.id,
      input.conversationId,
      input.role,
      input.content,
      input.model,
      input.status,
      '{}',
      input.now,
      input.now,
    )
    .run();
}

export async function getMessageHistory(db: D1Database, conversationId: string) {
  const history = await db
    .prepare(
      'SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT 40',
    )
    .bind(conversationId)
    .all<MessageHistoryRow>();

  return history.results;
}
