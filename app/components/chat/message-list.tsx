import { Bot, Loader2, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { Message } from '@/types/chat';

import { MessageContent } from './message-content';

type MessageListProps = {
  messages: Message[];
};

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-8">
      {messages.map((message) => (
        <article
          className={cn('flex gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}
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
              <MessageContent content={message.content} />
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
  );
}
