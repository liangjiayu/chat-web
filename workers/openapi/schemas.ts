import { z } from '@hono/zod-openapi';

export const MetadataSchema = z
  .record(z.string(), z.unknown())
  .openapi({ description: '扩展元数据' })
  .openapi('Metadata');

export const ConversationSchema = z
  .object({
    id: z.string().openapi({ description: '会话 ID' }),
    title: z.string().openapi({ description: '会话标题' }),
    model: z.string().openapi({ description: '使用的模型' }),
    metadata: MetadataSchema,
    created_at: z.number().int().openapi({ description: '创建时间戳' }),
    updated_at: z.number().int().openapi({ description: '更新时间戳' }),
  })
  .openapi('Conversation');

export const MessageSchema = z
  .object({
    id: z.string().openapi({ description: '消息 ID' }),
    conversation_id: z.string().openapi({ description: '所属会话 ID' }),
    role: z.enum(['system', 'user', 'assistant']).openapi({ description: '消息角色' }),
    content: z.string().openapi({ description: '消息内容' }),
    model: z.string().nullable().openapi({ description: '生成消息使用的模型' }),
    status: z.string().openapi({ description: '消息状态' }),
    metadata: MetadataSchema,
    created_at: z.number().int().openapi({ description: '创建时间戳' }),
    updated_at: z.number().int().openapi({ description: '更新时间戳' }),
  })
  .openapi('Message');
