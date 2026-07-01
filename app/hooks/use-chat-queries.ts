import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createConversation,
  deleteConversation,
  getConversationMessages,
  getConversations,
  renameConversation,
} from '@/api/conversations';

export const conversationKeys = {
  all: ['conversations'] as const,
};

export const messageKeys = {
  detail: (conversationId: string | null) => ['messages', conversationId] as const,
};

export function useConversationsQuery() {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: getConversations,
  });
}

export function useMessagesQuery(conversationId: string | null) {
  return useQuery({
    queryKey: messageKeys.detail(conversationId),
    queryFn: () => getConversationMessages(conversationId!),
    enabled: Boolean(conversationId),
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useRenameConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => renameConversation(id, title),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
