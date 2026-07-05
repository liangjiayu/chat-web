import type { ConversationMessagesResponse } from '@contracts/conversations';
import type { Conversation, Message } from '@contracts/models';
import { useQueryClient } from '@tanstack/react-query';
import { AudioLines, ChevronDown, Loader2, Mic, Plus, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  setConversationsCache,
  setConversationTitleCache,
  setMessagesCache,
} from '@/queries/conversation-cache';
import {
  conversationKeys,
  messageKeys,
  useConversationsQuery,
  useMessagesQuery,
} from '@/queries/conversations';
import { streamChat } from '@/services/chat-stream';
import { useChatStore } from '@/stores';

import { sortConversationsByUpdatedAt } from './utils';

export function ChatComposer() {
  const { id: activeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversationsQuery = useConversationsQuery();
  const messagesQuery = useMessagesQuery(activeId ?? null);
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

  async function sendMessage() {
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
      title: '新对话',
      model: 'deepseek-v4-flash',
      metadata: {},
      created_at: createdAt,
      updated_at: createdAt,
    };
    const optimisticMessages: Message[] = [
      {
        id: optimisticUserId,
        conversation_id: optimisticConversationId,
        role: 'user',
        content: prompt,
        model: activeConversation?.model ?? 'deepseek-v4-flash',
        status: 'done',
        metadata: {},
        created_at: createdAt,
        updated_at: createdAt,
      },
      {
        id: optimisticAssistantId,
        conversation_id: optimisticConversationId,
        role: 'assistant',
        content: '',
        model: activeConversation?.model ?? 'deepseek-v4-flash',
        status: 'streaming',
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

    try {
      for await (const parsed of streamChat({
        conversation_id: optimisticConversationId,
        prompt,
      })) {
        if (parsed.event === 'message') {
          setMessagesCache(queryClient, cacheConversationId, cacheConversation, (current) =>
            current.map((item) =>
              item.id === optimisticAssistantId
                ? { ...item, content: item.content + parsed.data.message.v }
                : item,
            ),
          );
        }

        if (parsed.event === 'done') {
          setMessagesCache(queryClient, cacheConversationId, cacheConversation, (current) =>
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
            queryKey: messageKeys.detail(cacheConversationId),
          });
        }

        if (parsed.event === 'title') {
          setConversationTitleCache(queryClient, cacheConversationId, parsed.data.content);
        }

        if (parsed.event === 'error') {
          throw new Error(parsed.data.message);
        }
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '发送失败');

      setMessagesCache(queryClient, cacheConversationId, cacheConversation, (current) =>
        current.filter(
          (item) => item.id !== optimisticAssistantId || item.content.trim().length > 0,
        ),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {error ? (
        <div className="pointer-events-auto mb-3 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      ) : null}
      <div className="pointer-events-auto rounded-[24px] border border-chat-border-strong bg-chat-surface p-3 shadow-chat-composer">
        <Textarea
          className="max-h-40 min-h-14 resize-none border-0 bg-transparent px-3 py-2 text-[17px] text-chat-foreground shadow-none placeholder:text-chat-foreground-muted focus-visible:ring-0 md:text-[20px]"
          disabled={isSending}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void sendMessage();
            }
          }}
          placeholder="给 Chatty 发送消息..."
          value={input}
        />
        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              className="size-9 rounded-lg text-chat-foreground hover:bg-chat-hover"
              size="icon"
              title="添加"
              type="button"
              variant="ghost"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              className="h-8 gap-1 rounded-lg px-2 text-sm font-semibold text-chat-foreground hover:bg-chat-hover"
              type="button"
              variant="ghost"
            >
              deepseek-v4-flash
              <ChevronDown className="h-3.5 w-3.5 text-chat-foreground-muted" />
            </Button>
            <Button
              className="size-9 rounded-lg text-chat-foreground hover:bg-chat-hover"
              size="icon"
              title="语音输入"
              type="button"
              variant="ghost"
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              className="size-9 rounded-lg text-chat-foreground hover:bg-chat-hover"
              size="icon"
              title="语音模式"
              type="button"
              variant="ghost"
            >
              <AudioLines className="h-4 w-4" />
            </Button>
            <Button
              className="size-9 rounded-lg bg-chat-foreground-strong text-chat-primary-foreground hover:bg-chat-primary-hover"
              disabled={!input.trim() || isSending}
              onClick={() => void sendMessage()}
              size="icon"
              title="发送"
              type="button"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-chat-foreground-muted">
        内容由 AI 生成，请仔细甄别
      </div>
    </>
  );
}
