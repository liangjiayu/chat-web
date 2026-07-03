import type { ConversationDTO, MessageDTO, Metadata } from './models';

export type ChatRequest = {
  conversationId?: string | null;
  content: string;
};

export type ChatStreamEvent =
  | {
      event: 'meta';
      data: {
        conversation: ConversationDTO;
        userMessage: MessageDTO;
      };
    }
  | { event: 'delta'; data: { content: string } }
  | {
      event: 'done';
      data: {
        messageId: string;
        content: string;
        metadata: Metadata;
        created_at: number;
        updated_at: number;
      };
    }
  | { event: 'error'; data: { message: string } };
