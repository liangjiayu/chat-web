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
import * as React from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';

import { AppLogo } from '@/components/app-logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useConversationsQuery } from '@/queries/conversations';
import { useChatStore } from '@/stores';

import { groupConversations } from './utils';

export function ConversationSidebar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const conversationsQuery = useConversationsQuery();
  const conversations = conversationsQuery.data ?? [];
  const groups = React.useMemo(() => groupConversations(conversations), [conversations]);
  const actionError = useChatStore((state) => state.actionError);
  const clearActionError = useChatStore((state) => state.clearActionError);
  const closeSidebar = useChatStore((state) => state.closeSidebar);
  const isSending = useChatStore((state) => state.isSending);
  const openDeleteDialog = useChatStore((state) => state.openDeleteDialog);
  const openRenameDialog = useChatStore((state) => state.openRenameDialog);
  const resetInput = useChatStore((state) => state.resetInput);
  const sidebarOpen = useChatStore((state) => state.sidebarOpen);
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const activeId = id ?? null;

  const loadConversation = (conversationId: string) => {
    void navigate(`/chat/${conversationId}`);
  };

  const startNewConversation = () => {
    if (actionError) {
      clearActionError();
    }
    resetInput();
    void navigate('/chat');
  };

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex h-screen w-[286px] shrink-0 flex-col overflow-hidden bg-chat-sidebar-background transition-all duration-200 md:relative md:translate-x-0',
        sidebarOpen
          ? 'translate-x-0 border-r border-chat-border md:w-[286px]'
          : '-translate-x-full border-r border-chat-border md:w-16 md:translate-x-0',
      )}
    >
      <div className={cn('h-full min-w-[286px] flex-col', sidebarOpen ? 'flex' : 'hidden')}>
        <div className="flex h-14 shrink-0 items-center justify-between px-3">
          <div className="flex items-center gap-2 font-serif text-2xl font-semibold tracking-normal text-chat-foreground-strong">
            <AppLogo className="h-8 w-8" />
            <span>Chatty</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              className="size-8 text-chat-foreground-muted hover:bg-chat-hover"
              size="icon"
              variant="ghost"
              title="搜索"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              className="hidden size-8 text-chat-foreground-muted hover:bg-chat-hover md:inline-flex"
              onClick={toggleSidebar}
              size="icon"
              variant="ghost"
              title="收起侧栏"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
            <Button
              className="size-8 text-chat-foreground-muted hover:bg-chat-hover md:hidden"
              onClick={closeSidebar}
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
            className="h-9 w-full justify-start gap-3 rounded-lg px-2.5 text-[15px] font-medium hover:bg-chat-hover"
            disabled={isSending}
            onClick={startNewConversation}
            variant="ghost"
          >
            <Plus className="h-4 w-4 rounded-full bg-chat-border-strong p-0.5" />
            开启新对话
          </Button>
          <SidebarNavItem icon={<MessageCircle className="h-4 w-4" />} label="会话" />
          <SidebarNavItem icon={<Folder className="h-4 w-4" />} label="项目" />
          <SidebarNavItem icon={<Archive className="h-4 w-4" />} label="文件" />
          <SidebarNavItem icon={<Code2 className="h-4 w-4" />} label="代码" muted />
          <SidebarNavItem icon={<Briefcase className="h-4 w-4" />} label="自定义" />
        </div>

        <div className="mt-4 flex items-center justify-between px-3 text-xs text-chat-foreground-muted">
          <span>最近</span>
          <Settings2 className="h-3.5 w-3.5" />
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4">
          {conversationsQuery.isLoading ? (
            <div className="flex items-center gap-2 px-3 text-sm text-chat-foreground-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              加载会话
            </div>
          ) : groups.length ? (
            groups.map((group) => (
              <section className="mb-4" key={group.label}>
                <h2 className="mb-1 px-2 text-xs font-medium text-chat-foreground-muted">
                  {group.label}
                </h2>
                <div className="space-y-0.5">
                  {group.items.map((conversation) => (
                    <div
                      className={cn(
                        'group flex h-8 items-center gap-1 rounded-lg px-2 text-sm',
                        activeId === conversation.id
                          ? 'bg-chat-selection text-chat-foreground-strong'
                          : 'hover:bg-chat-hover',
                      )}
                      key={conversation.id}
                    >
                      <button
                        className="min-w-0 flex-1 truncate text-left"
                        onClick={() => loadConversation(conversation.id)}
                        type="button"
                      >
                        {conversation.title}
                      </button>
                      <ConversationItemMenu
                        onDelete={() => openDeleteDialog(conversation.id)}
                        onRename={() => openRenameDialog(conversation)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="px-3 text-sm text-chat-foreground-muted">还没有会话</div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-chat-border p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chat-foreground-strong text-sm font-semibold text-chat-primary-foreground">
              L
            </div>
            <div>
              <div className="text-sm font-semibold">LJY</div>
              <div className="text-xs text-chat-foreground-muted">本地单用户</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              className="size-8 border-chat-border-strong bg-chat-sidebar-background text-chat-foreground-muted hover:bg-chat-hover"
              size="icon"
              variant="outline"
              title="导出"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              className="size-8 text-chat-foreground-muted hover:bg-chat-hover"
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
        <AppLogo className="mb-3 h-8 w-8" />
        <Button
          className="size-8 hover:bg-chat-hover"
          onClick={toggleSidebar}
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
            onClick={startNewConversation}
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
            <Button className="size-8 hover:bg-chat-hover" size="icon" variant="ghost" title="导出">
              <Download className="h-5 w-5" />
            </Button>
            <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border border-chat-sidebar-background bg-chat-info" />
          </div>
          <button
            className="flex h-12 w-12 items-center justify-center rounded-full bg-chat-foreground-strong text-base font-semibold text-chat-primary-foreground"
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

function ConversationItemMenu({
  onDelete,
  onRename,
}: {
  onDelete: () => void;
  onRename: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="size-6 text-chat-foreground-muted opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-chat-border-strong data-[state=open]:opacity-100"
          size="icon"
          title="更多"
          type="button"
          variant="ghost"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-30" side="bottom" align="start">
        <DropdownMenuItem onSelect={onRename}>
          <Edit3 className="h-4 w-4" />
          <span>编辑</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete} variant="destructive">
          <Trash2 className="h-4 w-4" />
          <span>删除</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
        'flex h-9 w-full items-center gap-3 rounded-lg px-2.5 text-left text-[15px] font-medium hover:bg-chat-hover',
        muted && 'text-chat-foreground-muted',
      )}
      type="button"
    >
      <span className="text-chat-foreground-muted">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {muted ? (
        <span className="rounded-full border border-chat-border-strong bg-chat-sidebar-background px-1.5 py-0.5 text-xs text-chat-info">
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
        'size-8 hover:bg-chat-hover',
        muted && 'text-chat-foreground-muted hover:text-chat-foreground-muted',
        rounded && 'rounded-full bg-chat-hover',
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
