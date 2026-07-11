import { z } from '@hono/zod-openapi';

export const ChatRequestSchema = z
  .object({
    conversation_id: z.string().trim().min(1),
    prompt: z.string().trim().min(1).optional(),
    message_id: z.string().trim().min(1).optional(),
  })
  .refine((value) => Boolean(value.prompt) !== Boolean(value.message_id), {
    message: 'prompt 和 message_id 必须且只能提供一个',
  })
  .openapi('ChatRequest');
