import { ChevronDown, FileText, Menu } from 'lucide-react';
import { useParams } from 'react-router';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useConversationsQuery } from '@/queries/conversations';
import { useChatStore } from '@/stores';

type ChatHeaderProps = {
  isEmptyHome?: boolean;
};

export function ChatHeader({ isEmptyHome = false }: ChatHeaderProps) {
  const { id } = useParams();
  const conversationsQuery = useConversationsQuery();
  const openSidebar = useChatStore((state) => state.openSidebar);
  const sidebarOpen = useChatStore((state) => state.sidebarOpen);
  const activeConversation =
    conversationsQuery.data?.find((conversation) => conversation.id === id) ?? null;

  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between bg-chat-main-background px-3 md:px-7',
        isEmptyHome ? 'border-b border-transparent md:hidden' : 'border-b border-transparent',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className={cn(
            'size-8 text-chat-foreground-muted hover:bg-chat-hover md:hidden',
            sidebarOpen && 'hidden',
          )}
          onClick={openSidebar}
          size="icon"
          variant="ghost"
          title="打开侧栏"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 items-center gap-1">
          <h1 className="truncate text-[15px] font-semibold text-chat-foreground-strong">
            {activeConversation?.title ?? '新对话'}
          </h1>
          <ChevronDown className="h-4 w-4 shrink-0 text-chat-foreground-muted" />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          className="size-8 text-chat-foreground hover:bg-chat-hover"
          size="icon"
          title="文档"
          type="button"
          variant="ghost"
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          className="h-8 rounded-lg border-chat-border-strong bg-chat-surface px-3 text-sm font-semibold text-chat-foreground-strong shadow-sm hover:bg-chat-hover"
          size="sm"
          type="button"
          variant="outline"
        >
          分享
        </Button>
      </div>
    </header>
  );
}
