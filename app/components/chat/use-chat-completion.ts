import { useQueryClient } from '@tanstack/react-query';

import { setConversationTitleCache, setMessagesCache } from '@/queries/conversation-cache';
import { conversationKeys, messageKeys } from '@/queries/conversations';
import { streamChat } from '@/services/chat-stream';
import { useChatStore } from '@/stores';
import type { ChatRequest, Conversation } from '@/types/api.generated';

type RunCompletionInput = {
  conversation: Conversation;
  conversationId: string;
  optimisticAssistantId: string;
  request: ChatRequest;
};

export function useChatCompletion() {
  const queryClient = useQueryClient();
  const setActionError = useChatStore((state) => state.setActionError);
  const setSending = useChatStore((state) => state.setSending);

  return async function runCompletion({
    conversation,
    conversationId,
    optimisticAssistantId,
    request,
  }: RunCompletionInput) {
    try {
      for await (const parsed of streamChat(request)) {
        if (parsed.event === 'message') {
          setMessagesCache(queryClient, conversationId, conversation, (current) =>
            current.map((item) =>
              item.id === optimisticAssistantId
                ? { ...item, content: item.content + parsed.data.message.v }
                : item,
            ),
          );
        }

        if (parsed.event === 'done') {
          setMessagesCache(queryClient, conversationId, conversation, (current) =>
            current.map((item) =>
              item.id === optimisticAssistantId
                ? {
                    ...item,
                    id: parsed.data.message.id,
                    status: 'done',
                    metadata: parsed.data.message.metadata,
                    created_at: parsed.data.message.created_at,
                    updated_at: parsed.data.message.updated_at,
                  }
                : item,
            ),
          );
          setSending(false);
          void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
          void queryClient.invalidateQueries({
            queryKey: messageKeys.detail(conversationId),
          });
        }

        if (parsed.event === 'title') {
          setConversationTitleCache(queryClient, conversationId, parsed.data.content);
        }

        if (parsed.event === 'error') {
          throw new Error(parsed.data.message);
        }
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '发送失败');

      setMessagesCache(queryClient, conversationId, conversation, (current) =>
        current.filter(
          (item) => item.id !== optimisticAssistantId || item.content.trim().length > 0,
        ),
      );
    } finally {
      setSending(false);
    }
  };
}
