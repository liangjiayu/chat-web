import {
  Edit3,
  Loader2,
  MessageSquarePlus,
  MoreHorizontal,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types/chat';

import type { ConversationGroup } from './utils';

type ConversationSidebarProps = {
  activeId: string | null;
  groups: ConversationGroup[];
  isLoading: boolean;
  isSending: boolean;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onLoadConversation: (conversationId: string) => void;
  onNewConversation: () => void;
  onOpenDelete: (conversation: Conversation) => void;
  onOpenRename: (conversation: Conversation) => void;
};

export function ConversationSidebar({
  activeId,
  groups,
  isLoading,
  isSending,
  sidebarOpen,
  onCloseSidebar,
  onLoadConversation,
  onNewConversation,
  onOpenDelete,
  onOpenRename,
}: ConversationSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 w-[264px] flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground transition-transform duration-200 md:static',
        sidebarOpen ? 'flex translate-x-0' : 'hidden -translate-x-full',
      )}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 text-xl font-semibold text-[#3566ff]">
          <Sparkles className="h-6 w-6" />
          <span>deepseek</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" title="搜索">
            <Search className="h-4 w-4" />
          </Button>
          <Button
            className="md:hidden"
            onClick={onCloseSidebar}
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
          disabled={isSending}
          onClick={onNewConversation}
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
        ) : groups.length ? (
          groups.map((group) => (
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
                      onClick={() => onLoadConversation(conversation.id)}
                      type="button"
                    >
                      {conversation.title}
                    </button>
                    <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        onClick={() => onOpenRename(conversation)}
                        size="icon"
                        title="重命名"
                        variant="ghost"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => onOpenDelete(conversation)}
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
  );
}
