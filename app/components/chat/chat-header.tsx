import { ChevronDown, Share } from 'lucide-react';

import { Button } from '@/components/ui/button';

type ChatHeaderProps = {
  title?: string | null;
};

export function ChatHeader({ title }: ChatHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between px-3 py-3 md:px-7">
      <div className="min-w-0">
        {title ? (
          <div className="flex min-w-0 items-center gap-1">
            <h1 className="truncate text-[15px] font-semibold text-chat-foreground-strong">
              {title}
            </h1>
            <ChevronDown className="h-4 w-4 shrink-0 text-chat-foreground-muted" />
          </div>
        ) : null}
      </div>
      <Button title="分享" type="button" variant="ghost">
        <Share className="size-4" />
        分享
      </Button>
    </header>
  );
}
