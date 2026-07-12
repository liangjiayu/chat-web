import { z } from '@hono/zod-openapi';

import { ConversationSchema, MessageSchema } from '../../openapi/schemas';

export const ConversationIdParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({ param: { name: 'id', in: 'path' } }),
});

export const MessageParamsSchema = z.object({
  conversationId: z
    .string()
    .min(1)
    .openapi({ param: { name: 'conversationId', in: 'path' } }),
  messageId: z
    .string()
    .min(1)
    .openapi({ param: { name: 'messageId', in: 'path' } }),
});

export const CreateConversationRequestSchema = z
  .object({
    title: z.string().optional(),
  })
  .openapi('CreateConversationRequest');

export const RenameConversationRequestSchema = z
  .object({ title: z.string().trim().min(1) })
  .openapi('RenameConversationRequest');

export const EditMessageRequestSchema = z
  .object({ content: z.string().trim().min(1) })
  .openapi('EditMessageRequest');

export const ConversationListResponseSchema = z
  .array(ConversationSchema)
  .openapi('ConversationListResponse');

export const CreateConversationResponseSchema = z
  .object({ conversation: ConversationSchema })
  .openapi('CreateConversationResponse');

export const ConversationResponseSchema = ConversationSchema.openapi('ConversationResponse');

export const ConversationMessagesResponseSchema = z
  .object({
    conversation: ConversationSchema,
    messages: z.array(MessageSchema),
  })
  .openapi('ConversationMessagesResponse');

export const DeleteConversationResponseSchema = z
  .object({ success: z.literal(true) })
  .openapi('DeleteConversationResponse');

export const EditMessageResponseSchema = z
  .object({ success: z.literal(true) })
  .openapi('EditMessageResponse');
