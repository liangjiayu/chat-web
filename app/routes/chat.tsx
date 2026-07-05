import {
  ChatComposer,
  ChatHeader,
  ChatLayout,
  ConversationDialogs,
  ConversationSidebar,
  EmptyChat,
  useChatWorkspace,
} from '@/components/chat';

export function meta() {
  return [{ title: 'Chatty' }, { name: 'description', content: 'Chatty conversation workspace' }];
}

export default function Chat() {
  const workspace = useChatWorkspace({ activeId: null });
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
          isEmptyHome
          onOpenSidebar={() => workspace.setSidebarOpen(true)}
          sidebarOpen={workspace.sidebarOpen}
        />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 pt-[25vh] pb-10 md:px-6">
            <EmptyChat composer={composer} />
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
