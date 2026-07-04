import type { Conversation } from '@contracts/models';
import { ChevronDown, FileText, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChatHeaderProps = {
  activeConversation: Conversation | null;
  isEmptyHome?: boolean;
  sidebarOpen: boolean;
  onOpenSidebar: () => void;
};

export function ChatHeader({
  activeConversation,
  isEmptyHome = false,
  sidebarOpen,
  onOpenSidebar,
}: ChatHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-14 shrink-0 items-center justify-between bg-[#fbfbfa] px-3 md:px-7',
        isEmptyHome ? 'border-b border-transparent md:hidden' : 'border-b border-transparent',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          className={cn(
            'size-8 text-[#5f5a52] hover:bg-[#efede7] md:hidden',
            sidebarOpen && 'hidden',
          )}
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
      <div className="flex shrink-0 items-center gap-2">
        <Button
          className="size-8 text-[#34302a] hover:bg-[#efefed]"
          size="icon"
          title="文档"
          type="button"
          variant="ghost"
        >
          <FileText className="h-4 w-4" />
        </Button>
        <Button
          className="h-8 rounded-lg border-[#dedbd2] bg-white px-3 text-sm font-semibold text-[#2f2b25] shadow-sm hover:bg-[#f5f5f3]"
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
