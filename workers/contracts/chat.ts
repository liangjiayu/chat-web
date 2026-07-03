import type { ConversationDTO, MessageDTO, Metadata } from './models';

export type ChatRequest = {
  conversation_id?: string | null;
  content: string;
};

export type ChatStreamEvent =
  | {
      event: 'meta';
      data: {
        conversation: ConversationDTO;
        user_message: MessageDTO;
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
