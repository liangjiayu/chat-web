import { create } from 'zustand';

type RenameDialogPayload = {
  id: string;
  title: string;
};

type ChatStore = {
  actionError: string | null;
  conversationToDeleteId: string | null;
  conversationToRenameId: string | null;
  input: string;
  isSending: boolean;
  renameTitle: string;
  sidebarOpen: boolean;
  clearActionError: () => void;
  closeDeleteDialog: () => void;
  closeRenameDialog: () => void;
  closeSidebar: () => void;
  openDeleteDialog: (conversationId: string) => void;
  openRenameDialog: (conversation: RenameDialogPayload) => void;
  openSidebar: () => void;
  resetInput: () => void;
  setActionError: (message: string | null) => void;
  setInput: (value: string) => void;
  setRenameTitle: (value: string) => void;
  setSending: (isSending: boolean) => void;
  toggleSidebar: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  actionError: null,
  conversationToDeleteId: null,
  conversationToRenameId: null,
  input: '',
  isSending: false,
  renameTitle: '',
  sidebarOpen: true,
  clearActionError: () => set({ actionError: null }),
  closeDeleteDialog: () => set({ conversationToDeleteId: null }),
  closeRenameDialog: () => set({ conversationToRenameId: null, renameTitle: '' }),
  closeSidebar: () => set({ sidebarOpen: false }),
  openDeleteDialog: (conversationId) => set({ conversationToDeleteId: conversationId }),
  openRenameDialog: (conversation) =>
    set({ conversationToRenameId: conversation.id, renameTitle: conversation.title }),
  openSidebar: () => set({ sidebarOpen: true }),
  resetInput: () => set({ input: '' }),
  setActionError: (message) => set({ actionError: message }),
  setInput: (value) => set({ input: value }),
  setRenameTitle: (value) => set({ renameTitle: value }),
  setSending: (isSending) => set({ isSending }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
