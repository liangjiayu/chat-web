import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';
import { useNavigate } from 'react-router';

import { streamChat } from '@/api/chat-stream';
import {
  conversationKeys,
  messageKeys,
  useConversationsQuery,
  useDeleteConversationMutation,
  useMessagesQuery,
  useRenameConversationMutation,
} from '@/queries/conversations';
import type {
  Conversation,
  ConversationListResponse,
  ConversationMessagesResponse,
  Message,
} from '@/types/chat';

import { groupConversations, sortConversationsByUpdatedAt } from './utils';

type UseChatWorkspaceOptions = {
  activeId: string | null;
};

export function useChatWorkspace({ activeId }: UseChatWorkspaceOptions) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const conversationsQuery = useConversationsQuery();
  const renameConversationMutation = useRenameConversationMutation();
  const deleteConversationMutation = useDeleteConversationMutation();
  const messagesQuery = useMessagesQuery(activeId);
  const [pendingMessages, setPendingMessages] = React.useState<Message[] | null>(null);
  const [input, setInput] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [conversationToRename, setConversationToRename] = React.useState<Conversation | null>(null);
  const [renameTitle, setRenameTitle] = React.useState('');
  const [conversationToDelete, setConversationToDelete] = React.useState<Conversation | null>(null);

  const conversations = conversationsQuery.data?.conversations ?? [];
  const messages = pendingMessages ?? messagesQuery.data?.messages ?? [];
  const activeConversation = conversations.find((item) => item.id === activeId) ?? null;
  const queryError = conversationsQuery.error ?? messagesQuery.error;
  const error = actionError ?? (queryError instanceof Error ? queryError.message : null);
  const groupedConversations = React.useMemo(
    () => groupConversations(conversations),
    [conversations],
  );

  React.useEffect(() => {
    setPendingMessages(null);
  }, [activeId]);

  function setConversationsCache(updater: (current: Conversation[]) => Conversation[]) {
    queryClient.setQueryData<ConversationListResponse>(conversationKeys.all, (current) => ({
      conversations: updater(current?.conversations ?? []),
    }));
  }

  function setMessagesCache(
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

  function loadMessages(conversationId: string) {
    setPendingMessages(null);
    void navigate(`/chat/${conversationId}`);
  }

  function startNewConversation() {
    setActionError(null);
    setPendingMessages(null);
    setInput('');
    void navigate('/chat');
  }

  function openRenameDialog(conversation: Conversation) {
    setConversationToRename(conversation);
    setRenameTitle(conversation.title);
  }

  function closeRenameDialog() {
    setConversationToRename(null);
    setRenameTitle('');
  }

  async function renameConversation() {
    if (!conversationToRename) {
      return;
    }

    const title = renameTitle.trim();

    if (!title || title === conversationToRename.title) {
      closeRenameDialog();
      return;
    }

    setActionError(null);

    try {
      const data = await renameConversationMutation.mutateAsync({
        id: conversationToRename.id,
        title,
      });

      setConversationsCache((current) =>
        current.map((item) => (item.id === conversationToRename.id ? data.conversation : item)),
      );
      closeRenameDialog();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '重命名失败');
    }
  }

  function handleRenameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void renameConversation();
  }

  async function deleteConversation(conversation: Conversation) {
    await deleteConversationMutation.mutateAsync(conversation.id);

    const next = conversations.filter((item) => item.id !== conversation.id);
    setConversationsCache(() => next);
    queryClient.removeQueries({ queryKey: messageKeys.detail(conversation.id) });

    if (activeId === conversation.id) {
      if (next[0]) {
        loadMessages(next[0].id);
      } else {
        setPendingMessages(null);
        void navigate('/chat');
      }
    }
  }

  async function confirmDeleteConversation() {
    if (!conversationToDelete) {
      return;
    }

    setActionError(null);

    try {
      await deleteConversation(conversationToDelete);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '删除失败');
    } finally {
      setConversationToDelete(null);
    }
  }

  async function sendMessage() {
    const content = input.trim();

    if (!content || isSending) {
      return;
    }

    setInput('');
    setActionError(null);
    setIsSending(true);

    const optimisticUserId = `local-user-${Date.now()}`;
    const optimisticAssistantId = `local-assistant-${Date.now()}`;
    const optimisticConversationId = activeId ?? 'pending';
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
        content,
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
    let cacheConversationId = activeId;
    let cacheConversation = fallbackConversation;

    if (activeId) {
      setMessagesCache(activeId, fallbackConversation, (current) => [
        ...current,
        ...optimisticMessages,
      ]);
    } else {
      setPendingMessages(optimisticMessages);
    }

    try {
      for await (const parsed of streamChat({ conversationId: activeId, content })) {
        if (parsed.event === 'meta') {
          cacheConversationId = parsed.data.conversation.id;
          cacheConversation = parsed.data.conversation;
          void navigate(`/chat/${parsed.data.conversation.id}`, { replace: !activeId });
          setConversationsCache((current) => {
            const exists = current.some((item) => item.id === parsed.data.conversation.id);
            const next = exists
              ? current.map((item) =>
                  item.id === parsed.data.conversation.id ? parsed.data.conversation : item,
                )
              : [parsed.data.conversation, ...current];

            return sortConversationsByUpdatedAt(next);
          });

          const updateMessages = (current: Message[]) =>
            current.map((item) =>
              item.id === optimisticUserId
                ? parsed.data.userMessage
                : {
                    ...item,
                    conversation_id:
                      item.conversation_id === 'pending'
                        ? parsed.data.conversation.id
                        : item.conversation_id,
                  },
            );

          if (activeId) {
            setMessagesCache(activeId, parsed.data.conversation, updateMessages);
          } else {
            const nextMessages = updateMessages(pendingMessages ?? optimisticMessages);
            queryClient.setQueryData<ConversationMessagesResponse>(
              messageKeys.detail(parsed.data.conversation.id),
              {
                conversation: parsed.data.conversation,
                messages: nextMessages,
              },
            );
            setPendingMessages(null);
          }
        }

        if (parsed.event === 'delta' && cacheConversationId) {
          setMessagesCache(cacheConversationId, cacheConversation, (current) =>
            current.map((item) =>
              item.id === optimisticAssistantId
                ? { ...item, content: item.content + parsed.data.content }
                : item,
            ),
          );
        }

        if (parsed.event === 'done' && cacheConversationId) {
          setMessagesCache(cacheConversationId, cacheConversation, (current) =>
            current.map((item) =>
              item.id === optimisticAssistantId
                ? {
                    ...item,
                    id: parsed.data.messageId,
                    content: parsed.data.content,
                    status: 'done',
                    metadata: parsed.data.metadata,
                    created_at: parsed.data.created_at,
                    updated_at: parsed.data.updated_at,
                  }
                : item,
            ),
          );
          void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
        }

        if (parsed.event === 'error') {
          throw new Error(parsed.data.message);
        }
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '发送失败');

      if (cacheConversationId) {
        setMessagesCache(cacheConversationId, cacheConversation, (current) =>
          current.filter(
            (item) => item.id !== optimisticAssistantId || item.content.trim().length > 0,
          ),
        );
      } else {
        setPendingMessages((current) =>
          (current ?? []).filter(
            (item) => item.id !== optimisticAssistantId || item.content.trim().length > 0,
          ),
        );
      }
    } finally {
      setIsSending(false);
    }
  }

  return {
    activeConversation,
    activeId,
    conversationToDelete,
    conversationToRename,
    error,
    groupedConversations,
    handleRenameSubmit,
    input,
    isLoading: conversationsQuery.isLoading,
    isSending,
    loadMessages,
    messages,
    openRenameDialog,
    renameTitle,
    setConversationToDelete,
    setInput,
    setRenameTitle,
    setSidebarOpen,
    sidebarOpen,
    closeRenameDialog,
    confirmDeleteConversation,
    sendMessage,
    startNewConversation,
  };
}
