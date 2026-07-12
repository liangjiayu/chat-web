import { DEFAULT_CONVERSATION_TITLE, DEFAULT_MODEL } from '../../constants';
import {
  createConversation,
  getConversation,
  touchConversation,
} from '../../repositories/conversations';
import {
  createMessage,
  getLastUserMessage,
  getMessage,
  getMessageHistory,
} from '../../repositories/messages';
import { generateConversationTitle, requestChatCompletion } from './deepseek-client';
import { createChatStream } from './stream';

export class ChatServiceError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

export async function completeChat(input: {
  env: Cloudflare.Env;
  conversationId: string;
  editedMessageId?: string;
  prompt?: string;
}) {
  const now = Date.now();
  const model = DEFAULT_MODEL;
  let conversation = await getConversation(input.env.DB, input.conversationId);
  let isNewConversation = false;
  let initialTitle = conversation?.title ?? '';
  let prompt = input.prompt;

  if (input.editedMessageId) {
    if (!conversation) {
      throw new ChatServiceError('会话不存在', 404);
    }

    const editedMessage = await getMessage(
      input.env.DB,
      input.conversationId,
      input.editedMessageId,
    );

    if (!editedMessage) {
      throw new ChatServiceError('消息不存在', 404);
    }

    if (editedMessage.role !== 'user') {
      throw new ChatServiceError('只能编辑用户消息');
    }

    const lastUserMessage = await getLastUserMessage(input.env.DB, input.conversationId);

    if (lastUserMessage?.id !== editedMessage.id) {
      throw new ChatServiceError('只能编辑最后一条用户消息');
    }

    prompt = editedMessage.content.trim();
  } else if (!conversation) {
    initialTitle = DEFAULT_CONVERSATION_TITLE;
    isNewConversation = true;
    conversation = await createConversation(input.env.DB, {
      id: input.conversationId,
      title: initialTitle,
      model,
      now,
    });
  }

  if (!prompt) {
    throw new ChatServiceError('消息不能为空');
  }

  if (!input.editedMessageId) {
    await createMessage(input.env.DB, {
      id: crypto.randomUUID(),
      conversationId: input.conversationId,
      role: 'user',
      content: prompt,
      model,
      status: 'done',
      now,
    });
    await touchConversation(input.env.DB, input.conversationId, now);
  }

  const history = await getMessageHistory(input.env.DB, input.conversationId);
  const upstream = await requestChatCompletion({
    apiKey: input.env.DEEPSEEK_API_KEY,
    model,
    messages: history,
  });

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => '');
    throw new ChatServiceError(detail || 'DeepSeek 请求失败', upstream.status || 502);
  }

  const titlePromise = isNewConversation
    ? generateConversationTitle({
        apiKey: input.env.DEEPSEEK_API_KEY,
        model,
        prompt,
      }).catch(() => null)
    : Promise.resolve(null);

  return createChatStream({
    db: input.env.DB,
    upstream,
    conversationId: input.conversationId,
    model,
    isNewConversation,
    initialTitle,
    titlePromise,
  });
}
