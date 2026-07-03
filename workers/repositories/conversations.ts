import { LOCAL_USER_ID } from '../constants';
import type { Conversation, ConversationRow } from '../types';
import { toConversation } from '../utils/chat';

export async function getConversations(db: D1Database) {
  const rows = await db
    .prepare(
      'SELECT id, title, model, metadata, created_at, updated_at FROM conversations WHERE user_id = ? AND deleted_at IS NULL ORDER BY updated_at DESC',
    )
    .bind(LOCAL_USER_ID)
    .all<ConversationRow>();

  return (rows.results ?? []).map(toConversation);
}

export async function getConversation(db: D1Database, id: string) {
  const row = await db
    .prepare(
      'SELECT id, title, model, metadata, created_at, updated_at FROM conversations WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
    )
    .bind(id, LOCAL_USER_ID)
    .first<ConversationRow>();

  return row ? toConversation(row) : null;
}

export async function createConversation(
  db: D1Database,
  input: {
    id: string;
    title: string;
    model: string;
    now: number;
  },
): Promise<Conversation> {
  await db
    .prepare(
      'INSERT INTO conversations (id, user_id, title, model, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
    .bind(input.id, LOCAL_USER_ID, input.title, input.model, '{}', input.now, input.now)
    .run();

  return {
    id: input.id,
    title: input.title,
    model: input.model,
    metadata: {},
    created_at: input.now,
    updated_at: input.now,
  };
}

export async function renameConversation(
  db: D1Database,
  input: {
    id: string;
    title: string;
    now: number;
  },
) {
  return db
    .prepare(
      'UPDATE conversations SET title = ?, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
    )
    .bind(input.title, input.now, input.id, LOCAL_USER_ID)
    .run();
}

export async function deleteConversation(db: D1Database, id: string, now: number) {
  return db
    .prepare(
      'UPDATE conversations SET deleted_at = ?, updated_at = ? WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
    )
    .bind(now, now, id, LOCAL_USER_ID)
    .run();
}

export async function touchConversation(db: D1Database, id: string, now: number) {
  return db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').bind(now, id).run();
}
