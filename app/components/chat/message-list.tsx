import type { Message } from '@contracts/models';
import { Check, Copy, Loader2, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { MarkdownRenderer } from './markdown-renderer';

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  const lastAssistantMessageId = messages.reduce<string | null>(
    (lastId, message) => (message.role === 'assistant' && message.content ? message.id : lastId),
    null,
  );

  return (
    <div className="space-y-8">
      {messages.map((message) => (
        <article
          className={cn(
            'group flex gap-3',
            message.role === 'user' ? 'justify-end' : 'justify-start',
          )}
          key={message.id}
        >
          <div
            className={cn(
              'max-w-full',
              message.role === 'user' ? 'flex flex-col items-end' : 'text-chat-foreground-strong',
            )}
          >
            <div
              className={cn(
                'pr-4 text-[15px] leading-7 md:text-base',
                message.role === 'user'
                  ? 'rounded-2xl bg-chat-selection px-4 py-2.5 text-chat-foreground'
                  : 'text-chat-foreground-strong',
              )}
            >
              {message.content ? (
                <MarkdownRenderer content={message.content} />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  正在生成
                </div>
              )}
            </div>
            {message.content ? (
              <div
                className={cn(
                  'pointer-events-none mt-2 flex h-7 items-center gap-1 text-chat-foreground-muted opacity-0 transition-opacity group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                  message.id === lastAssistantMessageId && 'pointer-events-auto opacity-100',
                )}
              >
                <CopyMessageAction content={message.content} />
                {message.role !== 'user' ? (
                  <>
                    <MessageAction icon={<ThumbsUp className="h-4 w-4" />} label="赞" />
                    <MessageAction icon={<ThumbsDown className="h-4 w-4" />} label="踩" />
                    <MessageAction icon={<RotateCcw className="h-4 w-4" />} label="重新生成" />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function CopyMessageAction({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

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
