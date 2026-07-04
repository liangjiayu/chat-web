import type {
  ConversationListResponse,
  ConversationMessagesResponse,
} from '@contracts/conversations';
import type { Conversation, Message } from '@contracts/models';
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

  const conversations = conversationsQuery.data ?? [];
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
    queryClient.setQueryData<ConversationListResponse>(conversationKeys.all, (current) =>
      updater(current ?? []),
    );
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

  function setConversationTitleCache(conversationId: string, title: string) {
    setConversationsCache((current) =>
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
      const conversation = await renameConversationMutation.mutateAsync({
        id: conversationToRename.id,
        title,
      });

      setConversationsCache((current) =>
        current.map((item) => (item.id === conversationToRename.id ? conversation : item)),
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
    const prompt = input.trim();

    if (!prompt || isSending) {
      return;
    }

    setInput('');
    setActionError(null);
    setIsSending(true);

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
    const isNewConversation = !activeId;

    if (activeId) {
      setMessagesCache(activeId, fallbackConversation, (current) => [
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
      setConversationsCache((current) =>
        sortConversationsByUpdatedAt([fallbackConversation, ...current]),
      );
      setPendingMessages(optimisticMessages);
      void navigate(`/chat/${optimisticConversationId}`, { replace: true });
    }

    try {
      for await (const parsed of streamChat({
        conversation_id: optimisticConversationId,
        prompt,
      })) {
        if (isNewConversation) {
          setPendingMessages(null);
        }

        if (parsed.event === 'message') {
          setMessagesCache(cacheConversationId, cacheConversation, (current) =>
            current.map((item) =>
              item.id === optimisticAssistantId
                ? { ...item, content: item.content + parsed.data.message.v }
                : item,
            ),
          );
        }

        if (parsed.event === 'done') {
          setMessagesCache(cacheConversationId, cacheConversation, (current) =>
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
          setIsSending(false);
          void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
          void queryClient.invalidateQueries({
            queryKey: messageKeys.detail(cacheConversationId),
          });
        }

        if (parsed.event === 'title') {
          setConversationTitleCache(cacheConversationId, parsed.data.content);
        }

        if (parsed.event === 'error') {
          throw new Error(parsed.data.message);
        }
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '发送失败');

      setMessagesCache(cacheConversationId, cacheConversation, (current) =>
        current.filter(
          (item) => item.id !== optimisticAssistantId || item.content.trim().length > 0,
        ),
      );

      if (isNewConversation) {
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
