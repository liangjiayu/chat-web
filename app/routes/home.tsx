import { useQueryClient } from '@tanstack/react-query';
import {
  Bot,
  Check,
  ChevronLeft,
  Edit3,
  Loader2,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Send,
  Sparkles,
  Trash2,
  User,
  X,
} from 'lucide-react';
import * as React from 'react';
import { useNavigate, useParams } from 'react-router';

import { streamChat } from '@/api/chat-stream';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  conversationKeys,
  messageKeys,
  useConversationsQuery,
  useCreateConversationMutation,
  useDeleteConversationMutation,
  useMessagesQuery,
  useRenameConversationMutation,
} from '@/hooks/use-chat-queries';
import { cn } from '@/lib/utils';
import type {
  Conversation,
  ConversationListResponse,
  ConversationMessagesResponse,
  Message,
} from '@/types/chat';

export function meta() {
  return [
    { title: 'DeepSeek Chat' },
    { name: 'description', content: 'DeepSeek conversation workspace' },
  ];
}

function groupConversations(conversations: Conversation[]) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
  });

  return conversations.reduce<Array<{ label: string; items: Conversation[] }>>(
    (groups, conversation) => {
      const label = formatter.format(new Date(conversation.updated_at)).replace('/', '-');
      const group = groups.find((item) => item.label === label);

      if (group) {
        group.items.push(conversation);
      } else {
        groups.push({ label, items: [conversation] });
      }

      return groups;
    },
    [],
  );
}

function sortConversationsByUpdatedAt(conversations: Conversation[]) {
  return conversations.reduce<Conversation[]>((items, conversation) => {
    const updatedAt = new Date(conversation.updated_at).getTime();
    const index = items.findIndex((item) => new Date(item.updated_at).getTime() < updatedAt);

    if (index === -1) {
      return [...items, conversation];
    }

    return [...items.slice(0, index), conversation, ...items.slice(index)];
  }, []);
}

function renderMessageContent(content: string) {
  const parts = content.split(/(```[\s\S]*?```)/g).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const code = part.replace(/^```[a-zA-Z0-9_-]*\n?/, '').replace(/```$/, '');

      return (
        <pre
          className="my-3 overflow-x-auto rounded-md bg-foreground p-4 text-sm text-background"
          key={`${index}-${part.slice(0, 12)}`}
        >
          <code>{code}</code>
        </pre>
      );
    }

    return (
      <div className="leading-7 whitespace-pre-wrap" key={`${index}-${part.slice(0, 12)}`}>
        {part}
      </div>
    );
  });
}

export default function Home() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { id } = useParams();
  const conversationsQuery = useConversationsQuery();
  const createConversationMutation = useCreateConversationMutation();
  const renameConversationMutation = useRenameConversationMutation();
  const deleteConversationMutation = useDeleteConversationMutation();
  const activeId = id ?? null;
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
  const isLoading = conversationsQuery.isLoading;
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

  async function createConversation() {
    setActionError(null);

    try {
      const data = await createConversationMutation.mutateAsync({ title: '新对话' });

      setConversationsCache((current) => [data.conversation, ...current]);
      queryClient.setQueryData<ConversationMessagesResponse>(
        messageKeys.detail(data.conversation.id),
        {
          conversation: data.conversation,
          messages: [],
        },
      );
      setPendingMessages(null);
      void navigate(`/chat/${data.conversation.id}`);
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '创建会话失败');
    }
  }

  function openRenameDialog(conversation: Conversation) {
    setConversationToRename(conversation);
    setRenameTitle(conversation.title);
  }

  async function renameConversation() {
    if (!conversationToRename) {
      return;
    }

    const title = renameTitle.trim();

    if (!title || title === conversationToRename.title) {
      setConversationToRename(null);
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
      setConversationToRename(null);
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
    const createdAt = new Date().toISOString();
    const fallbackConversation: Conversation = activeConversation ?? {
      id: optimisticConversationId,
      title: '新对话',
      model: 'deepseek-v4-flash',
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
        created_at: createdAt,
      },
      {
        id: optimisticAssistantId,
        conversation_id: optimisticConversationId,
        role: 'assistant',
        content: '',
        model: activeConversation?.model ?? 'deepseek-v4-flash',
        status: 'streaming',
        created_at: createdAt,
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
                    created_at: parsed.data.created_at,
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

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 w-[264px] flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground transition-transform duration-200 md:static',
            sidebarOpen ? 'flex translate-x-0' : 'hidden -translate-x-full',
          )}
        >
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2 text-xl font-semibold text-sidebar-primary">
              <Sparkles className="h-6 w-6" />
              <span>deepseek</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="icon" variant="ghost" title="搜索">
                <Search className="h-4 w-4" />
              </Button>
              <Button
                className="md:hidden"
                onClick={() => setSidebarOpen(false)}
                size="icon"
                variant="ghost"
                title="关闭侧栏"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="px-3">
            <Button
              className="h-11 w-full rounded-full"
              onClick={createConversation}
              variant="outline"
            >
              <MessageSquarePlus className="h-4 w-4" />
              开启新对话
            </Button>
          </div>

          <div className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
            {isLoading ? (
              <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                加载会话
              </div>
            ) : groupedConversations.length ? (
              groupedConversations.map((group) => (
                <section className="mb-5" key={group.label}>
                  <h2 className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
                    {group.label}
                  </h2>
                  <div className="space-y-1">
                    {group.items.map((conversation) => (
                      <div
                        className={cn(
                          'group flex h-11 items-center gap-2 rounded-xl px-3 text-sm',
                          activeId === conversation.id
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground/80 hover:bg-background',
                        )}
                        key={conversation.id}
                      >
                        <button
                          className="min-w-0 flex-1 truncate text-left"
                          onClick={() => loadMessages(conversation.id)}
                          type="button"
                        >
                          {conversation.title}
                        </button>
                        <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            onClick={() => openRenameDialog(conversation)}
                            size="icon"
                            title="重命名"
                            variant="ghost"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => setConversationToDelete(conversation)}
                            size="icon"
                            title="删除"
                            variant="ghost"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="px-3 text-sm text-muted-foreground">还没有会话</div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-sidebar-border p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
                LJ
              </div>
              <div>
                <div className="text-sm font-medium">LJY</div>
                <div className="text-xs text-muted-foreground">本地单用户</div>
              </div>
            </div>
            <Button size="icon" variant="ghost" title="更多">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            aria-label="关闭侧栏遮罩"
            className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
        ) : null}

        <section className="flex min-w-0 flex-1 flex-col bg-card">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
                size="icon"
                variant="ghost"
                title="打开侧栏"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button
                className="hidden md:inline-flex"
                onClick={() => setSidebarOpen((value) => !value)}
                size="icon"
                variant="ghost"
                title={sidebarOpen ? '收起侧栏' : '展开侧栏'}
              >
                {sidebarOpen ? (
                  <PanelLeftClose className="h-5 w-5" />
                ) : (
                  <PanelLeftOpen className="h-5 w-5" />
                )}
              </Button>
              <div className="min-w-0">
                <h1 className="truncate text-sm font-semibold md:text-base">
                  {activeConversation?.title ?? '新对话'}
                </h1>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-primary" />
                  <span>{activeConversation?.model ?? 'deepseek-v4-flash'}</span>
                </div>
              </div>
            </div>
            <Button size="icon" variant="ghost" title="返回顶部">
              <ChevronLeft className="h-5 w-5 rotate-90" />
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-4 pt-8 pb-36 md:px-6">
              {messages.length ? (
                <div className="space-y-8">
                  {messages.map((message) => (
                    <article
                      className={cn(
                        'flex gap-4',
                        message.role === 'user' ? 'justify-end' : 'justify-start',
                      )}
                      key={message.id}
                    >
                      {message.role !== 'user' ? (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </div>
                      ) : null}
                      <div
                        className={cn(
                          'max-w-[82%] text-sm md:text-base',
                          message.role === 'user'
                            ? 'rounded-2xl bg-primary px-4 py-3 text-primary-foreground'
                            : 'text-card-foreground',
                        )}
                      >
                        {message.content ? (
                          renderMessageContent(message.content)
                        ) : (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            正在生成
                          </div>
                        )}
                      </div>
                      {message.role === 'user' ? (
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                          <User className="h-4 w-4" />
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Bot className="h-7 w-7" />
                    </div>
                    <h2 className="text-xl font-semibold">今天想聊什么？</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      发送第一条消息后，会话和消息会写入 D1。
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className={cn(
              'pointer-events-none fixed inset-x-0 bottom-0 z-10',
              sidebarOpen ? 'md:left-[264px]' : 'md:left-0',
            )}
          >
            <div className="mx-auto max-w-3xl px-4 pb-5 md:px-6">
              {error ? (
                <div className="pointer-events-auto mb-3 rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              ) : null}
              <div className="pointer-events-auto rounded-3xl border border-border bg-background p-3 shadow-[0_12px_40px_rgb(15_23_42_/_0.12)]">
                <Textarea
                  className="max-h-40 min-h-14 resize-none border-0 px-2 shadow-none focus-visible:ring-0"
                  disabled={isSending}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      void sendMessage();
                    }
                  }}
                  placeholder="给 DeepSeek 发送消息"
                  value={input}
                />
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" type="button" variant="secondary">
                      <Sparkles className="h-4 w-4" />
                      深度思考
                    </Button>
                    <Button size="sm" type="button" variant="outline">
                      <Search className="h-4 w-4" />
                      智能搜索
                    </Button>
                  </div>
                  <Button
                    className="rounded-full"
                    disabled={!input.trim() || isSending}
                    onClick={sendMessage}
                    size="icon"
                    title="发送"
                    type="button"
                  >
                    {isSending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5" />
                <span>内容由 AI 生成，请仔细甄别</span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setConversationToRename(null);
            setRenameTitle('');
          }
        }}
        open={Boolean(conversationToRename)}
      >
        <DialogContent>
          <form className="grid gap-4" onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>重命名会话</DialogTitle>
              <DialogDescription>修改会话在侧栏中显示的名称。</DialogDescription>
            </DialogHeader>
            <Input
              onChange={(event) => setRenameTitle(event.target.value)}
              placeholder="会话名称"
              value={renameTitle}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  取消
                </Button>
              </DialogClose>
              <Button disabled={!renameTitle.trim()} type="submit">
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            setConversationToDelete(null);
          }
        }}
        open={Boolean(conversationToDelete)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除「{conversationToDelete?.title}」及其中的所有消息，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => void confirmDeleteConversation()}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
