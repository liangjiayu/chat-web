import type { ReactNode } from 'react';

type ChatLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
};

export function ChatLayout({ children, sidebar, sidebarOpen, onCloseSidebar }: ChatLayoutProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex h-screen overflow-hidden">
        {sidebar}
        {sidebarOpen ? (
          <button
            aria-label="关闭侧栏遮罩"
            className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
            onClick={onCloseSidebar}
            type="button"
          />
        ) : null}
        <section className="flex min-w-0 flex-1 flex-col bg-card">{children}</section>
      </div>
    </main>
  );
}
