import type { ConversationRecord, MessageRecord } from '../db/schema';

export type { MessageRole, Metadata } from '../db/schema';

export type ConversationDTO = Pick<
  ConversationRecord,
  'id' | 'title' | 'model' | 'metadata' | 'created_at' | 'updated_at'
>;

export type MessageDTO = Pick<
  MessageRecord,
  | 'id'
  | 'conversation_id'
  | 'role'
  | 'content'
  | 'model'
  | 'status'
  | 'metadata'
  | 'created_at'
  | 'updated_at'
>;

export type MessageHistoryDTO = Pick<MessageRecord, 'role' | 'content'>;
