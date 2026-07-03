export type Bindings = {
  DB: D1Database;
  DEEPSEEK_API_KEY?: string;
  DEEPSEEK_MODEL?: string;
  VALUE_FROM_CLOUDFLARE?: string;
};

export type Metadata = Record<string, unknown>;

export type ConversationRow = {
  id: string;
  title: string;
  model: string;
  metadata: string;
  created_at: number;
  updated_at: number;
};

export type MessageRow = {
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

export type Conversation = Omit<ConversationRow, 'metadata'> & {
  metadata: Metadata;
};

export type Message = Omit<MessageRow, 'metadata'> & {
  metadata: Metadata;
};

export type MessageHistoryRow = Pick<MessageRow, 'role' | 'content'>;
