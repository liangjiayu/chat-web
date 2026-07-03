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

export type ConversationListResponse = {
  conversations: Conversation[];
};

export type ConversationMessagesResponse = {
  conversation: Conversation;
  messages: Message[];
};

export type StreamEvent =
  | {
      event: 'meta';
      data: {
        conversation: Conversation;
        user_message: Message;
      };
    }
  | { event: 'delta'; data: { content: string } }
  | {
      event: 'done';
      data: {
        message_id: string;
        content: string;
        metadata: Metadata;
        created_at: number;
        updated_at: number;
      };
    }
  | { event: 'error'; data: { message: string } };
