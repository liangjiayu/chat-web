import { PanelLeftOpen } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';

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
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#2d2a26]">
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
        {!sidebarOpen ? (
          <Button
            className="fixed top-3 left-3 z-20 hidden border-[#dedbd2] bg-[#fbfaf7]/90 text-[#5f5a52] shadow-sm backdrop-blur hover:bg-[#f1efea] md:inline-flex"
            onClick={onOpenSidebar}
            size="icon"
            title="展开侧栏"
            variant="outline"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        ) : null}
        <section className="flex min-w-0 flex-1 flex-col bg-[#fbfaf7]">{children}</section>
      </div>
    </main>
  );
}
