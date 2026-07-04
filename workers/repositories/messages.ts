import { asc, eq } from 'drizzle-orm';
import type { Message, MessageHistory } from '@contracts/models';

import { createDb } from '../db/client';
import { messages } from '../db/schema';

export async function getMessages(db: D1Database, conversationId: string) {
  return createDb(db)
    .select()
    .from(messages)
    .where(eq(messages.conversation_id, conversationId))
    .orderBy(asc(messages.created_at));
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
