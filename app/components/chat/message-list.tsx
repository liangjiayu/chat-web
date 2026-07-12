import { useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Loader2, Pencil, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MESSAGE_ROLE, MESSAGE_STATUS } from '@/constants';
import { cn } from '@/lib/utils';
import { setMessagesCache } from '@/queries/conversation-cache';
import { editMessage } from '@/services/conversations';
import { useChatStore } from '@/stores';
import type { Conversation, Message } from '@/types/api-generated';

import { MarkdownRenderer } from './markdown-renderer';
import { useChatCompletion } from './use-chat-completion';

type MessageListProps = {
  conversation: Conversation | null;
  messages: Message[];
};

export function MessageList({ conversation, messages }: MessageListProps) {
  const queryClient = useQueryClient();
  const runCompletion = useChatCompletion();
  const isSending = useChatStore((state) => state.isSending);
  const setActionError = useChatStore((state) => state.setActionError);
  const setSending = useChatStore((state) => state.setSending);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const lastAssistantMessageId = messages.reduce<string | null>(
    (lastId, message) =>
      message.role === MESSAGE_ROLE.ASSISTANT && message.content ? message.id : lastId,
    null,
  );
  const lastUserMessageId = messages.reduce<string | null>(
    (lastId, message) => (message.role === MESSAGE_ROLE.USER ? message.id : lastId),
    null,
  );

  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const submitEdit = async (message: Message) => {
    const content = editContent.trim();

    if (!content || isSending) {
      return;
    }

    if (!conversation) {
      setActionError('会话不存在');
      return;
    }

    const now = Date.now();
    const optimisticAssistantId = `local-assistant-${now}`;

    setActionError(null);
    setSending(true);

    try {
      await editMessage(message.conversation_id, message.id, content);

      setMessagesCache(queryClient, message.conversation_id, conversation, (current) => [
        ...current
          .filter(
            (item) => item.role !== MESSAGE_ROLE.ASSISTANT || item.created_at <= message.created_at,
          )
          .map((item) => (item.id === message.id ? { ...item, content, updated_at: now } : item)),
        {
          id: optimisticAssistantId,
          conversation_id: message.conversation_id,
          role: MESSAGE_ROLE.ASSISTANT,
          content: '',
          model: conversation.model,
          status: MESSAGE_STATUS.STREAMING,
          metadata: {},
          created_at: now,
          updated_at: now,
        },
      ]);
      cancelEditing();

      await runCompletion({
        conversation,
        conversationId: message.conversation_id,
        optimisticAssistantId,
        request: {
          conversation_id: message.conversation_id,
          message_id: message.id,
        },
      });
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '编辑失败');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-5">
      {messages.map((message) => {
        const isUser = message.role === MESSAGE_ROLE.USER;
        const isEditing = editingMessageId === message.id;
        const canEditLastUser = isUser && message.id === lastUserMessageId && !isSending;

        return (
          <article
            className={cn('group flex flex-col', isUser ? 'items-end' : 'items-start')}
            key={message.id}
          >
            {isEditing ? (
              <InlineMessageEditor
                content={editContent}
                disabled={isSending}
                onCancel={cancelEditing}
                onChange={setEditContent}
                onSubmit={() => void submitEdit(message)}
              />
            ) : (
              <MessageContent content={message.content} isUser={isUser} />
            )}
            {message.content && !isEditing ? (
              <MessageActions
                canEdit={canEditLastUser}
                content={message.content}
                isAlwaysVisible={message.id === lastAssistantMessageId}
                isUser={isUser}
                onEdit={() => startEditing(message)}
              />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
  const contentNode = content ? (
    isUser ? (
      content
    ) : (
      <MarkdownRenderer content={content} />
    )
  ) : (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      正在生成
    </div>
  );

  return (
    <div
      className={cn(
        'max-w-full text-base',
        isUser
          ? 'rounded-full bg-[#F3F3F3] px-4 py-2.5 wrap-break-word whitespace-pre-wrap'
          : 'text-chat-foreground-strong',
      )}
    >
      {contentNode}
    </div>
  );
}

function MessageActions({
  canEdit,
  content,
  isAlwaysVisible,
  isUser,
  onEdit,
}: {
  canEdit: boolean;
  content: string;
  isAlwaysVisible: boolean;
  isUser: boolean;
  onEdit: () => void;
}) {
  return (
    <div
      className={cn(
        'pointer-events-none mt-1 flex h-7 items-center gap-1 text-chat-foreground-muted opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100',
        isUser ? 'justify-end' : 'justify-start',
        isAlwaysVisible && 'pointer-events-auto opacity-100',
      )}
    >
      <CopyMessageAction content={content} />
      {canEdit ? (
        <MessageAction icon={<Pencil className="h-4 w-4" />} label="编辑" onClick={onEdit} />
      ) : null}
      {!isUser ? (
        <>
          <MessageAction icon={<ThumbsUp className="h-4 w-4" />} label="赞" />
          <MessageAction icon={<ThumbsDown className="h-4 w-4" />} label="踩" />
          <MessageAction icon={<RotateCcw className="h-4 w-4" />} label="重新生成" />
        </>
      ) : null}
    </div>
  );
}

function InlineMessageEditor({
  content,
  disabled,
  onCancel,
  onChange,
  onSubmit,
}: {
  content: string;
  disabled: boolean;
  onCancel: () => void;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const canSubmit = Boolean(content.trim()) && !disabled;

  return (
    <form
      className="w-[min(680px,calc(100vw-2rem))] rounded-[24px] border border-chat-border-strong bg-chat-surface p-3 shadow-chat-composer"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Textarea
        autoFocus
        className="max-h-40 min-h-16 resize-none border-0 bg-transparent px-3 py-2 text-[15px] shadow-none focus-visible:ring-0 md:text-base"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSubmit();
          }
        }}
        value={content}
      />
      <div className="mt-1 flex justify-end gap-2">
        <Button disabled={disabled} onClick={onCancel} type="button" variant="outline">
          取消
        </Button>
        <Button disabled={!canSubmit} type="submit">
          发送
        </Button>
      </div>
    </form>
  );
}

function CopyMessageAction({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <MessageAction
      icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      label={copied ? '已复制' : '复制'}
      onClick={() => void handleCopy()}
    />
  );
}

function MessageAction({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex size-7 items-center justify-center rounded-lg hover:bg-chat-hover hover:text-chat-foreground"
      onClick={onClick}
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}
