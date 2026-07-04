import type { ReactNode } from 'react';

type ChatLayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
  onOpenSidebar: () => void;
};

export function ChatLayout({
  children,
  sidebar,
  sidebarOpen,
  onCloseSidebar,
  onOpenSidebar,
}: ChatLayoutProps) {
  void onOpenSidebar;

  return (
    <main className="min-h-screen bg-[#fbfbfa] text-[#2d2a26]">
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
        <section className="flex min-w-0 flex-1 flex-col bg-[#fbfbfa]">{children}</section>
      </div>
    </main>
  );
}
