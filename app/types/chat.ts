export type Conversation = {
  id: string;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model: string | null;
  status: string;
  created_at: string;
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
        userMessage: Message;
      };
    }
  | { event: 'delta'; data: { content: string } }
  | { event: 'done'; data: { messageId: string; content: string; created_at: string } }
  | { event: 'error'; data: { message: string } };
