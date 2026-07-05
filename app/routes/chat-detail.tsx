import { useOutletContext } from 'react-router';

import { ChatComposer, ChatHeader, MessageList } from '@/components/chat';

import type { ChatWorkspaceContext } from './chat';

export function meta() {
  return [{ title: 'Chatty' }, { name: 'description', content: 'Chatty conversation workspace' }];
}

export default function ChatDetail() {
  const workspace = useOutletContext<ChatWorkspaceContext>();

  return (
    <>
      <ChatHeader
        activeConversation={workspace.activeConversation}
        onOpenSidebar={() => workspace.setSidebarOpen(true)}
        sidebarOpen={workspace.sidebarOpen}
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full w-full max-w-[960px] flex-col px-4 pt-7 pb-52 md:px-6">
          <MessageList messages={workspace.messages} />
        </div>
      </div>
      <div
        className={[
          'pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#fbfbfa] via-[#fbfbfa] to-[#fbfbfa]/0 pt-12',
          workspace.sidebarOpen ? 'md:left-[286px]' : 'md:left-16',
        ].join(' ')}
      >
        <div className="mx-auto max-w-[1000px] px-4 pb-3 md:px-6">
          <ChatComposer
            error={workspace.error}
            input={workspace.input}
            isSending={workspace.isSending}
            onInputChange={workspace.setInput}
            onSend={() => void workspace.sendMessage()}
          />
        </div>
      </div>
    </>
  );
}
