import { Copy, Loader2, RotateCcw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import type { Message } from '@contracts/models';

import { MessageContent } from './message-content';

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-8">
      {messages.map((message) => (
        <article
          className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
          key={message.id}
        >
          {message.role !== 'user' ? (
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center text-[#d85f3d]">
              <Sparkles className="h-7 w-7" />
            </div>
          ) : null}
          <div
            className={cn(
              'max-w-[82%] text-[15px] leading-7 md:text-base',
              message.role === 'user'
                ? 'rounded-2xl bg-[#edeae3] px-4 py-2.5 text-[#34302a]'
                : 'text-[#2f2b25]',
            )}
          >
            {message.content ? (
              <MessageContent content={message.content} />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在生成
              </div>
            )}
            {message.role !== 'user' && message.content ? (
              <div className="mt-4 flex items-center gap-1 text-[#8b857d]">
                <MessageAction icon={<Copy className="h-4 w-4" />} label="复制" />
                <MessageAction icon={<ThumbsUp className="h-4 w-4" />} label="赞" />
                <MessageAction icon={<ThumbsDown className="h-4 w-4" />} label="踩" />
                <MessageAction icon={<RotateCcw className="h-4 w-4" />} label="重新生成" />
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function MessageAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      className="flex size-7 items-center justify-center rounded-lg hover:bg-[#efede7] hover:text-[#34302a]"
      title={label}
      type="button"
    >
      {icon}
    </button>
  );
}
