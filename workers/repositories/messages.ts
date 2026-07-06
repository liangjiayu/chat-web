import type { Message, MessageHistory } from '@contracts/models';
import { and, asc, desc, eq, gt } from 'drizzle-orm';

import { createDb } from '../db/client';
import { messages } from '../db/schema';

export async function getMessages(db: D1Database, conversationId: string) {
  return createDb(db)
    .select()
    .from(messages)
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(asc(messages.created_at));
}

export async function getMessage(db: D1Database, conversationId: string, messageId: string) {
  const row = await createDb(db)
    .select()
    .from(messages)
    .where(and(eq(messages.conversation_id, conversationId), eq(messages.id, messageId)))
    .get();

  return row ?? null;
}

export async function getLastUserMessage(db: D1Database, conversationId: string) {
  const row = await createDb(db)
    .select()
    .from(messages)
    .where(and(eq(messages.conversation_id, conversationId), eq(messages.role, 'user')))
    .orderBy(desc(messages.created_at))
    .get();

  return row ?? null;
}

export async function createMessage(
  db: D1Database,
  input: {
    id: string;
    conversationId: string;
    role: Message['role'];
    content: string;
    model: string | null;
    status: string;
    now: number;
  },
) {
  await createDb(db)
    .insert(messages)
    .values({
      id: input.id,
      conversation_id: input.conversationId,
      role: input.role,
      content: input.content,
      model: input.model,
      status: input.status,
      metadata: {},
      created_at: input.now,
      updated_at: input.now,
    })
    .run();
}

export async function updateMessageContent(
  db: D1Database,
  input: {
    conversationId: string;
    id: string;
    content: string;
    now: number;
  },
) {
  return createDb(db)
    .update(messages)
    .set({ content: input.content, updated_at: input.now })
    .where(and(eq(messages.conversation_id, input.conversationId), eq(messages.id, input.id)))
    .run();
}

export async function deleteAssistantMessagesAfter(
  db: D1Database,
  input: {
    conversationId: string;
    createdAt: number;
  },
) {
  return createDb(db)
    .delete(messages)
    .where(
      and(
        eq(messages.conversation_id, input.conversationId),
        eq(messages.role, 'assistant'),
        gt(messages.created_at, input.createdAt),
      ),
    )
    .run();
}

export async function getMessageHistory(db: D1Database, conversationId: string) {
  const history = await createDb(db)
    .select({
      role: messages.role,
      content: messages.content,
    })
    .from(messages)
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(asc(messages.created_at))
    .limit(40);

  return history satisfies MessageHistory[];
}
