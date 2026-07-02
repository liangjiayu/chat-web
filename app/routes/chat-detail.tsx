import { useParams } from 'react-router';

import {
  ChatComposer,
  ChatHeader,
  ChatLayout,
  ConversationDialogs,
  ConversationSidebar,
  MessageList,
  useChatWorkspace,
} from '@/components/chat';

export function meta() {
  return [
    { title: 'DeepSeek Chat' },
    { name: 'description', content: 'DeepSeek conversation workspace' },
  ];
}

export default function ChatDetail() {
  const { id } = useParams();
  const workspace = useChatWorkspace({ activeId: id ?? null });

  return (
    <>
      <ChatLayout
        sidebar={
          <ConversationSidebar
            activeId={workspace.activeId}
            groups={workspace.groupedConversations}
            isLoading={workspace.isLoading}
            isSending={workspace.isSending}
            onCloseSidebar={() => workspace.setSidebarOpen(false)}
            onLoadConversation={workspace.loadMessages}
            onNewConversation={workspace.startNewConversation}
            onOpenDelete={workspace.setConversationToDelete}
            onOpenRename={workspace.openRenameDialog}
            onToggleSidebar={() => workspace.setSidebarOpen((value) => !value)}
            sidebarOpen={workspace.sidebarOpen}
          />
        }
        onCloseSidebar={() => workspace.setSidebarOpen(false)}
        onOpenSidebar={() => workspace.setSidebarOpen(true)}
        sidebarOpen={workspace.sidebarOpen}
      >
        <ChatHeader
          activeConversation={workspace.activeConversation}
          onOpenSidebar={() => workspace.setSidebarOpen(true)}
          sidebarOpen={workspace.sidebarOpen}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-[760px] flex-col px-4 pt-7 pb-48 md:px-6">
            <MessageList messages={workspace.messages} />
          </div>
        </div>
        <div
          className={[
            'pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#fbfaf7] via-[#fbfaf7] to-[#fbfaf7]/0 pt-10',
            workspace.sidebarOpen ? 'md:left-[286px]' : 'md:left-0',
          ].join(' ')}
        >
          <div className="mx-auto max-w-[760px] px-4 pb-2 md:px-6">
            <ChatComposer
              error={workspace.error}
              input={workspace.input}
              isSending={workspace.isSending}
              onInputChange={workspace.setInput}
              onSend={() => void workspace.sendMessage()}
            />
          </div>
        </div>
      </ChatLayout>
      <ConversationDialogs
        conversationToDelete={workspace.conversationToDelete}
        conversationToRename={workspace.conversationToRename}
        onCloseDelete={() => workspace.setConversationToDelete(null)}
        onCloseRename={workspace.closeRenameDialog}
        onConfirmDelete={() => void workspace.confirmDeleteConversation()}
        onRenameSubmit={workspace.handleRenameSubmit}
        onRenameTitleChange={workspace.setRenameTitle}
        renameTitle={workspace.renameTitle}
      />
    </>
  );
}
