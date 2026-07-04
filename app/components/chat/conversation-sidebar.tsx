import type { Conversation } from '@contracts/models';
import {
  Archive,
  Briefcase,
  Code2,
  Download,
  Edit3,
  Folder,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  onToggleSidebar: () => void;
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
  onToggleSidebar,
}: ConversationSidebarProps) {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex h-screen w-[286px] shrink-0 flex-col overflow-hidden bg-[#fbfbfa] text-[#34302a] transition-all duration-200 md:relative md:translate-x-0',
        sidebarOpen
          ? 'translate-x-0 border-r border-[#e8e4dc] md:w-[286px]'
          : '-translate-x-full border-r-0 md:w-16 md:translate-x-0',
      )}
    >
      <div className={cn('h-full min-w-[286px] flex-col', sidebarOpen ? 'flex' : 'hidden')}>
        <div className="flex h-14 shrink-0 items-center justify-between px-3">
          <div className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-normal text-[#2f2b25]">
            <span>DeepSeek</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              className="size-8 text-[#6d675f] hover:bg-[#ece9e1]"
              size="icon"
              variant="ghost"
              title="搜索"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              className="hidden size-8 text-[#6d675f] hover:bg-[#ece9e1] md:inline-flex"
              onClick={onToggleSidebar}
              size="icon"
              variant="ghost"
              title="收起侧栏"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
            <Button
              className="size-8 text-[#6d675f] hover:bg-[#ece9e1] md:hidden"
              onClick={onCloseSidebar}
              size="icon"
              variant="ghost"
              title="关闭侧栏"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1 px-2 py-2">
          <Button
            className="h-9 w-full justify-start gap-3 rounded-lg px-2.5 text-[15px] font-medium text-[#34302a] hover:bg-[#ece9e1]"
            disabled={isSending}
            onClick={onNewConversation}
            variant="ghost"
          >
            <Plus className="h-4 w-4 rounded-full bg-[#dedbd2] p-0.5" />
            开启新对话
          </Button>
          <SidebarNavItem icon={<MessageCircle className="h-4 w-4" />} label="会话" />
          <SidebarNavItem icon={<Folder className="h-4 w-4" />} label="项目" />
          <SidebarNavItem icon={<Archive className="h-4 w-4" />} label="文件" />
          <SidebarNavItem icon={<Code2 className="h-4 w-4" />} label="代码" muted />
          <SidebarNavItem icon={<Briefcase className="h-4 w-4" />} label="自定义" />
        </div>

        <div className="mt-4 flex items-center justify-between px-3 text-xs text-[#7b756d]">
          <span>最近</span>
          <Settings2 className="h-3.5 w-3.5" />
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {isLoading ? (
            <div className="flex items-center gap-2 px-3 text-sm text-[#7b756d]">
              <Loader2 className="h-4 w-4 animate-spin" />
              加载会话
            </div>
          ) : groups.length ? (
            groups.map((group) => (
              <section className="mb-4" key={group.label}>
                <h2 className="mb-1 px-2 text-xs font-medium text-[#928b82]">{group.label}</h2>
                <div>
                  {group.items.map((conversation) => (
                    <div
                      className={cn(
                        'group flex h-8 items-center gap-1 rounded-lg px-2 text-sm',
                        activeId === conversation.id
                          ? 'bg-[#ebe8e0] text-[#2f2b25]'
                          : 'text-[#4a453f] hover:bg-[#efede7]',
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
                          className="size-6 text-[#7b756d] hover:bg-[#dedbd2]"
                          onClick={() => onOpenRename(conversation)}
                          size="icon"
                          title="重命名"
                          variant="ghost"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          className="size-6 text-[#7b756d] hover:bg-[#dedbd2]"
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
            <div className="px-3 text-sm text-[#7b756d]">还没有会话</div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-[#e8e4dc] p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2f2b25] text-sm font-semibold text-white">
              L
            </div>
            <div>
              <div className="text-sm font-semibold text-[#34302a]">LJY</div>
              <div className="text-xs text-[#7b756d]">本地单用户</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              className="size-8 border-[#dedbd2] bg-[#fbfaf7] text-[#5f5a52] hover:bg-[#efede7]"
              size="icon"
              variant="outline"
              title="导出"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              className="size-8 text-[#5f5a52] hover:bg-[#ece9e1]"
              size="icon"
              variant="ghost"
              title="更多"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn('hidden h-full w-16 flex-col items-center py-3', !sidebarOpen && 'md:flex')}
      >
        <Button
          className="size-8 text-[#33312e] hover:bg-[#efefed]"
          onClick={onToggleSidebar}
          size="icon"
          title="展开侧栏"
          variant="ghost"
        >
          <PanelLeftOpen className="h-5 w-5" />
        </Button>

        <div className="mt-8 flex flex-col items-center gap-3">
          <CollapsedSidebarButton
            disabled={isSending}
            icon={<Plus className="h-5 w-5" />}
            label="开启新对话"
            onClick={onNewConversation}
            rounded
          />
          <CollapsedSidebarButton icon={<MessageCircle className="h-5 w-5" />} label="会话" />
          <CollapsedSidebarButton icon={<Archive className="h-5 w-5" />} label="文件" />
          <CollapsedSidebarButton icon={<Folder className="h-5 w-5" />} label="项目" />
          <CollapsedSidebarButton icon={<Code2 className="h-5 w-5" />} label="代码" muted />
          <CollapsedSidebarButton icon={<Briefcase className="h-5 w-5" />} label="自定义" />
        </div>

        <div className="mt-auto flex flex-col items-center gap-7 pb-2">
          <div className="relative">
            <Button
              className="size-8 text-[#33312e] hover:bg-[#efefed]"
              size="icon"
              variant="ghost"
              title="导出"
            >
              <Download className="h-5 w-5" />
            </Button>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border border-[#fbfbfa] bg-[#2f6fec]" />
          </div>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f2f2c] text-base font-semibold text-white"
            title="LJY"
            type="button"
          >
            L
          </button>
        </div>
      </div>
    </aside>
  );
}

function SidebarNavItem({
  icon,
  label,
  muted = false,
}: {
  icon: ReactNode;
  label: string;
  muted?: boolean;
}) {
  return (
    <button
      className={cn(
        'flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[15px] font-medium hover:bg-[#ece9e1]',
        muted ? 'text-[#aaa49b]' : 'text-[#34302a]',
      )}
      type="button"
    >
      <span className="text-[#5f5a52]">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {muted ? (
        <span className="rounded-full border border-[#d9d5cc] bg-[#fbfaf7] px-1.5 py-0.5 text-xs text-[#5f7197]">
          升级
        </span>
      ) : null}
    </button>
  );
}

function CollapsedSidebarButton({
  disabled,
  icon,
  label,
  muted = false,
  onClick,
  rounded = false,
}: {
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  muted?: boolean;
  onClick?: () => void;
  rounded?: boolean;
}) {
  return (
    <Button
      className={cn(
        'size-8 text-[#33312e] hover:bg-[#efefed]',
        muted && 'text-[#c1bfba] hover:text-[#9f9b94]',
        rounded && 'rounded-full bg-[#efefed]',
      )}
      disabled={disabled}
      onClick={onClick}
      size="icon"
      title={label}
      type="button"
      variant="ghost"
    >
      {icon}
    </Button>
  );
}
