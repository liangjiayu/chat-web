import { Outlet, useParams } from 'react-router';

import {
  ChatLayout,
  ConversationDialogs,
  ConversationSidebar,
  useChatWorkspace,
} from '@/components/chat';

export function meta() {
  return [{ title: 'Chatty' }, { name: 'description', content: 'Chatty conversation workspace' }];
}

export type ChatWorkspaceContext = ReturnType<typeof useChatWorkspace>;

export default function Chat() {
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
        <Outlet context={workspace} />
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
