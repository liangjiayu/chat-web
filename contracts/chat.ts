import type { Message } from './models';

export type ChatRequest = {
  conversation_id: string;
  prompt?: string;
  message_id?: string;
};

export type ChatStreamEvent =
  | { event: 'message'; data: { message: { v: string } } }
  | { event: 'title'; data: { content: string } }
  | {
      event: 'done';
      data: {
        message: Pick<Message, 'id' | 'metadata' | 'created_at' | 'updated_at'>;
      };
    }
  | { event: 'error'; data: { message: string } };
