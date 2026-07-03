import type { ConversationRow, MessageRow } from './db/schema';

export type Bindings = {
  DB: D1Database;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  VALUE_FROM_CLOUDFLARE?: string;
};

export type {
  ConversationRow,
  MessageHistoryRow,
  MessageRow,
  MessageRole,
  Metadata,
} from './db/schema';

export type Conversation = ConversationRow;

export type Message = MessageRow;
