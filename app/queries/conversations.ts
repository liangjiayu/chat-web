import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  conversations,
  deleteConversation,
  getConversation,
  renameConversation,
} from '@/services/conversations';

export const conversationKeys = {
  all: ['conversations'] as const,
};

export const messageKeys = {
  detail: (conversationId: string | null) => ['messages', conversationId] as const,
};

export function useConversationsQuery() {
  return useQuery({
    queryKey: conversationKeys.all,
    queryFn: conversations,
  });
}

export function useMessagesQuery(conversationId: string | null) {
  return useQuery({
    queryKey: messageKeys.detail(conversationId),
    queryFn: () => getConversation(conversationId!),
    enabled: Boolean(conversationId),
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
