import { useQueryClient } from '@tanstack/react-query';
import { ArrowUp, Loader2, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_CHAT_MODEL,
  DEFAULT_CONVERSATION_TITLE,
  MESSAGE_ROLE,
  MESSAGE_STATUS,
} from '@/constants';
import { setConversationsCache, setMessagesCache } from '@/queries/conversation-cache';
import { messageKeys, useConversationsQuery, useMessagesQuery } from '@/queries/conversations';
import { useChatStore } from '@/stores';
import type { Conversation, ConversationMessagesResponse, Message } from '@/types/api-generated';

import { useChatCompletion } from './use-chat-completion';
import { sortConversationsByUpdatedAt } from './utils';

export function ChatComposer() {
  const { id: activeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversationsQuery = useConversationsQuery();
  const messagesQuery = useMessagesQuery(activeId ?? null);
  const runCompletion = useChatCompletion();
  const actionError = useChatStore((state) => state.actionError);
  const input = useChatStore((state) => state.input);
  const isSending = useChatStore((state) => state.isSending);
  const setActionError = useChatStore((state) => state.setActionError);
  const setInput = useChatStore((state) => state.setInput);
  const setSending = useChatStore((state) => state.setSending);
  const conversations = conversationsQuery.data ?? [];
  const activeConversation =
    conversations.find((conversation) => conversation.id === activeId) ??
    messagesQuery.data?.conversation ??
    null;
  const queryError = conversationsQuery.error ?? messagesQuery.error;
  const error = actionError ?? (queryError instanceof Error ? queryError.message : null);

  const sendMessage = async () => {
    const prompt = input.trim();

    if (!prompt || isSending) {
      return;
    }

    setInput('');
    setActionError(null);
    setSending(true);

    const optimisticUserId = `local-user-${Date.now()}`;
    const optimisticAssistantId = `local-assistant-${Date.now()}`;
    const optimisticConversationId = activeId ?? crypto.randomUUID();
    const createdAt = Date.now();
    const fallbackConversation: Conversation = activeConversation ?? {
      id: optimisticConversationId,
      title: DEFAULT_CONVERSATION_TITLE,
      model: DEFAULT_CHAT_MODEL,
      metadata: {},
      created_at: createdAt,
      updated_at: createdAt,
    };
    const optimisticMessages: Message[] = [
      {
        id: optimisticUserId,
        conversation_id: optimisticConversationId,
        role: MESSAGE_ROLE.USER,
        content: prompt,
        model: activeConversation?.model ?? DEFAULT_CHAT_MODEL,
        status: MESSAGE_STATUS.DONE,
        metadata: {},
        created_at: createdAt,
        updated_at: createdAt,
      },
      {
        id: optimisticAssistantId,
        conversation_id: optimisticConversationId,
        role: MESSAGE_ROLE.ASSISTANT,
        content: '',
        model: activeConversation?.model ?? DEFAULT_CHAT_MODEL,
        status: MESSAGE_STATUS.STREAMING,
        metadata: {},
        created_at: createdAt,
        updated_at: createdAt,
      },
    ];
    const cacheConversationId = optimisticConversationId;
    const cacheConversation = fallbackConversation;

    if (activeId) {
      setMessagesCache(queryClient, activeId, fallbackConversation, (current) => [
        ...current,
        ...optimisticMessages,
      ]);
    } else {
      queryClient.setQueryData<ConversationMessagesResponse>(
        messageKeys.detail(optimisticConversationId),
        {
          conversation: fallbackConversation,
          messages: optimisticMessages,
        },
      );
      setConversationsCache(queryClient, (current) =>
        sortConversationsByUpdatedAt([fallbackConversation, ...current]),
      );
      void navigate(`/chat/${optimisticConversationId}`, { replace: true });
    }

    await runCompletion({
      conversation: cacheConversation,
      conversationId: cacheConversationId,
      optimisticAssistantId,
      request: {
        conversation_id: optimisticConversationId,
        prompt,
      },
    });
  };

  return (
    <>
      {error ? (
        <div className="pointer-events-auto mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="pointer-events-auto rounded-3xl border border-chat-border bg-chat-surface px-3.5 pt-4 pb-3 shadow-[0_8px_24px_rgb(0_0_0_/_0.07)]">
        <Textarea
          className="max-h-42 min-h-12 resize-none border-0 bg-transparent px-2.5 py-0 text-base leading-6 shadow-none placeholder:text-chat-foreground-muted focus-visible:ring-0 disabled:bg-transparent md:text-base"
          disabled={isSending}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="问问 Chatty"
          rows={2}
          value={input}
        />
        <div className="mt-1 flex min-h-9 items-center justify-between gap-2">
          <Button
            className="size-9 rounded-xl hover:bg-chat-hover"
            size="icon"
            title="添加"
            type="button"
            variant="ghost"
          >
            <Plus className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center">
            <Button
              className="size-9 rounded-full bg-chat-foreground-strong text-chat-primary-foreground hover:bg-chat-primary-hover disabled:bg-chat-border-strong disabled:text-chat-foreground-muted disabled:opacity-100"
              disabled={!input.trim() || isSending}
              onClick={() => void sendMessage()}
              size="icon"
              title="发送"
              type="button"
            >
              {isSending ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <ArrowUp className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
