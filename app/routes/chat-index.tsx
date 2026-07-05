import { useOutletContext } from 'react-router';

import { ChatComposer, ChatHeader, EmptyChat } from '@/components/chat';

import type { ChatWorkspaceContext } from './chat';

export default function ChatIndex() {
  const workspace = useOutletContext<ChatWorkspaceContext>();
  const composer = (
    <ChatComposer
      error={workspace.error}
      input={workspace.input}
      isSending={workspace.isSending}
      onInputChange={workspace.setInput}
      onSend={() => void workspace.sendMessage()}
    />
  );

  return (
    <>
      <ChatHeader
        activeConversation={workspace.activeConversation}
        isEmptyHome
        onOpenSidebar={() => workspace.setSidebarOpen(true)}
        sidebarOpen={workspace.sidebarOpen}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 pt-[25vh] pb-10 md:px-6">
          <EmptyChat composer={composer} />
        </div>
      </div>
    </>
  );
}
