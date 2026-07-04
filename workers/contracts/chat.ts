import type { MessageDTO } from './models';

export type ChatRequest = {
  conversation_id: string;
  prompt: string;
};

export type ChatStreamEvent =
  | { event: 'message'; data: { message: { v: string } } }
  | {
      event: 'done';
      data: {
        message: Pick<MessageDTO, 'id' | 'metadata' | 'created_at' | 'updated_at'>;
      };
    }
  | { event: 'error'; data: { message: string } };
