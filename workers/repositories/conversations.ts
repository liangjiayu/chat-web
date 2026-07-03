import { and, desc, eq, isNull } from 'drizzle-orm';

import { LOCAL_USER_ID } from '../constants';
import { createDb } from '../db/client';
import { conversations } from '../db/schema';
import type { Conversation, ConversationRow } from '../types';

const conversationColumns = {
  id: conversations.id,
  title: conversations.title,
  model: conversations.model,
  metadata: conversations.metadata,
  created_at: conversations.created_at,
  updated_at: conversations.updated_at,
};

export async function getConversations(db: D1Database) {
  return createDb(db)
    .select(conversationColumns)
    .from(conversations)
    .where(and(eq(conversations.user_id, LOCAL_USER_ID), isNull(conversations.deleted_at)))
    .orderBy(desc(conversations.updated_at));
}

export async function getConversation(db: D1Database, id: string) {
  const row = await createDb(db)
    .select(conversationColumns)
    .from(conversations)
    .where(
      and(
        eq(conversations.id, id),
        eq(conversations.user_id, LOCAL_USER_ID),
        isNull(conversations.deleted_at),
      ),
    )
    .get();

  return row ?? null;
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
  const conversation: ConversationRow = {
    id: input.id,
    title: input.title,
    model: input.model,
    metadata: {},
    created_at: input.now,
    updated_at: input.now,
  };

  await createDb(db)
    .insert(conversations)
    .values({
      ...conversation,
      user_id: LOCAL_USER_ID,
    })
    .run();

  return conversation;
}

export async function renameConversation(
  db: D1Database,
  input: {
    id: string;
    title: string;
    now: number;
  },
) {
  return createDb(db)
    .update(conversations)
    .set({ title: input.title, updated_at: input.now })
    .where(
      and(
        eq(conversations.id, input.id),
        eq(conversations.user_id, LOCAL_USER_ID),
        isNull(conversations.deleted_at),
      ),
    )
    .run();
}

export async function deleteConversation(db: D1Database, id: string, now: number) {
  return createDb(db)
    .update(conversations)
    .set({ deleted_at: now, updated_at: now })
    .where(
      and(
        eq(conversations.id, id),
        eq(conversations.user_id, LOCAL_USER_ID),
        isNull(conversations.deleted_at),
      ),
    )
    .run();
}

export async function touchConversation(db: D1Database, id: string, now: number) {
  return createDb(db)
    .update(conversations)
    .set({ updated_at: now })
    .where(eq(conversations.id, id))
    .run();
}
