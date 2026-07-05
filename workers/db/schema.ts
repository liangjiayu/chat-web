import { asc, desc, sql } from 'drizzle-orm';
import { check, foreignKey, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export type Metadata = Record<string, unknown>;
export const MESSAGE_ROLES = ['system', 'user', 'assistant'] as const;

export const conversations = sqliteTable(
  'conversations',
  {
    id: text('id').primaryKey(),
    user_id: text('user_id').notNull(),
    title: text('title').notNull(),
    model: text('model').notNull(),
    metadata: text('metadata', { mode: 'json' })
      .$type<Metadata>()
      .notNull()
      .default(sql`'{}'`),
    created_at: integer('created_at').notNull(),
    updated_at: integer('updated_at').notNull(),
    deleted_at: integer('deleted_at'),
  },
  (table) => [
    index('idx_conversations_user_updated').on(
      table.user_id,
      table.deleted_at,
      desc(table.updated_at),
    ),
  ],
);

export const messages = sqliteTable(
  'messages',
  {
    id: text('id').primaryKey(),
    conversation_id: text('conversation_id').notNull(),
    role: text('role', { enum: MESSAGE_ROLES }).notNull(),
    content: text('content').notNull(),
    model: text('model'),
    status: text('status').notNull().default('done'),
    metadata: text('metadata', { mode: 'json' })
      .$type<Metadata>()
      .notNull()
      .default(sql`'{}'`),
    created_at: integer('created_at').notNull(),
    updated_at: integer('updated_at').notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.conversation_id],
      foreignColumns: [conversations.id],
    }).onDelete('cascade'),
    index('idx_messages_conversation_created').on(table.conversation_id, asc(table.created_at)),
    check('messages_role_check', sql`${table.role} in ('system', 'user', 'assistant')`),
  ],
);

export const schema = {
  conversations,
  messages,
};
