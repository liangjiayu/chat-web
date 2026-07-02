import { ChevronDown, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';

type ChatHeaderProps = {
  activeConversation: Conversation | null;
  isEmptyHome?: boolean;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
};

export function ChatHeader({
  activeConversation,
  isEmptyHome = false,
  onOpenSidebar,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-[52px] shrink-0 items-center justify-between bg-[#fbfaf7] px-3 md:px-5',
        isEmptyHome ? 'border-b border-transparent md:hidden' : 'border-b border-transparent',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className="size-8 text-[#5f5a52] hover:bg-[#efede7] md:hidden"
          onClick={onOpenSidebar}
          size="icon"
          variant="ghost"
          title="打开侧栏"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex min-w-0 items-center gap-1">
          <h1 className="truncate text-[15px] font-semibold text-[#2f2b25]">
            {activeConversation?.title ?? '新对话'}
          </h1>
          <ChevronDown className="h-4 w-4 shrink-0 text-[#7b756d]" />
        </div>
      </div>
      <Button
        className="h-8 rounded-lg border-[#dedbd2] bg-[#fbfaf7] px-3 text-sm font-semibold text-[#2f2b25] shadow-sm hover:bg-[#f1efea]"
        size="sm"
        variant="outline"
      >
        分享
      </Button>
    </header>
  );
}
