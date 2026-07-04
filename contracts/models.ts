export type Metadata = Record<string, unknown>;

export type MessageRole = 'system' | 'user' | 'assistant';

export type Conversation = {
  id: string;
  title: string;
  model: string;
  metadata: Metadata;
  created_at: number;
  updated_at: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  model: string | null;
  status: string;
  metadata: Metadata;
  created_at: number;
  updated_at: number;
};

export type MessageHistory = Pick<Message, 'role' | 'content'>;
