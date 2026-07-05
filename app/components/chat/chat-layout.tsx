import type { ReactNode } from 'react';

import { useChatStore } from '@/stores';

type ChatLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

export function ChatLayout({ children, sidebar }: ChatLayoutProps) {
  const sidebarOpen = useChatStore((state) => state.sidebarOpen);
  const closeSidebar = useChatStore((state) => state.closeSidebar);

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#2d2a26]">
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        {sidebarOpen ? (
          <button
            aria-label="关闭侧栏遮罩"
            className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
            onClick={closeSidebar}
            type="button"
          />
        ) : null}
        <section className="flex min-w-0 flex-1 flex-col bg-[#fbfbfa]">{children}</section>
      </div>
    </main>
  );
}
