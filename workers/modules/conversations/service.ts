import { DEFAULT_CONVERSATION_TITLE, DEFAULT_MODEL } from '../../constants';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  renameConversation,
  touchConversation,
} from '../../repositories/conversations';
import {
  deleteAssistantMessagesAfter,
  getLastUserMessage,
  getMessage,
  getMessages,
  updateMessageContent,
} from '../../repositories/messages';
import { BusinessError } from '../../shared/errors';

export function listConversations(db: D1Database) {
  return getConversations(db);
}

export function createNewConversation(input: { env: Cloudflare.Env; title?: string }) {
  return createConversation(input.env.DB, {
    id: crypto.randomUUID(),
    title: input.title?.trim() || DEFAULT_CONVERSATION_TITLE,
    model: DEFAULT_MODEL,
    now: Date.now(),
  });
}

export async function getConversationDetail(db: D1Database, id: string) {
  const conversation = await getConversation(db, id);

  if (!conversation) {
    throw new BusinessError('会话不存在', 404);
  }

  return { conversation, messages: await getMessages(db, id) };
}

export async function renameExistingConversation(db: D1Database, id: string, title: string) {
  const result = await renameConversation(db, { id, title, now: Date.now() });

  if (!result.meta.changes) {
    throw new BusinessError('会话不存在', 404);
  }

  return (await getConversation(db, id))!;
}

export async function deleteExistingConversation(db: D1Database, id: string) {
  const result = await deleteConversation(db, id, Date.now());

  if (!result.meta.changes) {
    throw new BusinessError('会话不存在', 404);
  }
}

export async function editLastUserMessage(
  db: D1Database,
  conversationId: string,
  messageId: string,
  content: string,
) {
  const conversation = await getConversation(db, conversationId);

  if (!conversation) {
    throw new BusinessError('会话不存在', 404);
  }

  const message = await getMessage(db, conversationId, messageId);

  if (!message) {
    throw new BusinessError('消息不存在', 404);
  }

  if (message.role !== 'user') {
    throw new BusinessError('只能编辑用户消息');
  }

  const lastUserMessage = await getLastUserMessage(db, conversationId);

  if (lastUserMessage?.id !== message.id) {
    throw new BusinessError('只能编辑最后一条用户消息');
  }

  const now = Date.now();
  await updateMessageContent(db, { conversationId, id: message.id, content, now });
  await deleteAssistantMessagesAfter(db, {
    conversationId,
    createdAt: message.created_at,
  });
  await touchConversation(db, conversationId, now);
}
