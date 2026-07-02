import { ChevronLeft, Menu, PanelLeftClose, PanelLeftOpen, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';

type ChatHeaderProps = {
  activeConversation: Conversation | null;
  isEmptyHome?: boolean;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
  onToggleSidebar: () => void;
};

export function ChatHeader({
  activeConversation,
  isEmptyHome = false,
  sidebarOpen,
  onOpenSidebar,
  onToggleSidebar,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between px-4 md:px-6',
        isEmptyHome ? 'border-b border-transparent md:hidden' : 'border-b border-border',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className="md:hidden"
          onClick={onOpenSidebar}
          size="icon"
          variant="ghost"
          title="打开侧栏"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          className="hidden md:inline-flex"
          onClick={onToggleSidebar}
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
  );
}
