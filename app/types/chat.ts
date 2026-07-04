export type Metadata = Record<string, unknown>;

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
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  status: string;
  metadata: Metadata;
  created_at: number;
  updated_at: number;
};

export type ConversationListResponse = Conversation[];

export type ConversationMessagesResponse = {
  conversation: Conversation;
  messages: Message[];
};

export type StreamEvent =
  | { event: 'message'; data: { message: { v: string } } }
  | {
      event: 'done';
      data: {
        message: Pick<Message, 'id' | 'metadata' | 'created_at' | 'updated_at'>;
      };
    }
  | { event: 'error'; data: { message: string } };
