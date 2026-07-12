import type { QueryClient } from '@tanstack/react-query';

import type {
  ConversationListResponse,
  ConversationMessagesResponse,
  Conversation,
  Message,
} from '@/types/api-generated';

import { conversationKeys, messageKeys } from './conversations';

export function setConversationsCache(
  queryClient: QueryClient,
  updater: (current: Conversation[]) => Conversation[],
) {
  queryClient.setQueryData<ConversationListResponse>(conversationKeys.all, (current) =>
    updater(current ?? []),
  );
}

export function setMessagesCache(
  queryClient: QueryClient,
  conversationId: string,
  conversation: Conversation,
  updater: (current: Message[]) => Message[],
) {
  queryClient.setQueryData<ConversationMessagesResponse>(
    messageKeys.detail(conversationId),
    (current) => ({
      conversation: current?.conversation ?? conversation,
      messages: updater(current?.messages ?? []),
    }),
  );
}

export function setConversationTitleCache(
  queryClient: QueryClient,
  conversationId: string,
  title: string,
) {
  setConversationsCache(queryClient, (current) =>
    current.map((item) => (item.id === conversationId ? { ...item, title } : item)),
  );
  queryClient.setQueryData<ConversationMessagesResponse>(
    messageKeys.detail(conversationId),
    (current) =>
      current
        ? {
            ...current,
            conversation: { ...current.conversation, title },
          }
        : current,
  );
}
