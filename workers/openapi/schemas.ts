import { z } from '@hono/zod-openapi';

export const MetadataSchema = z.record(z.string(), z.unknown()).openapi('Metadata');

export const ConversationSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    model: z.string(),
    metadata: MetadataSchema,
    created_at: z.number().int(),
    updated_at: z.number().int(),
  })
  .openapi('Conversation');

export const MessageSchema = z
  .object({
    id: z.string(),
    conversation_id: z.string(),
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string(),
    model: z.string().nullable(),
    status: z.string(),
    metadata: MetadataSchema,
    created_at: z.number().int(),
    updated_at: z.number().int(),
  })
  .openapi('Message');
