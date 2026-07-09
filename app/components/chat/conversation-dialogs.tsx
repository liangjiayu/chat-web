import { useQueryClient } from '@tanstack/react-query';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { setConversationsCache } from '@/queries/conversation-cache';
import {
  messageKeys,
  useConversationsQuery,
  useDeleteConversationMutation,
  useRenameConversationMutation,
} from '@/queries/conversations';
import { useChatStore } from '@/stores';

export function ConversationDialogs() {
  const { id: activeId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const conversationsQuery = useConversationsQuery();
  const renameConversationMutation = useRenameConversationMutation();
  const deleteConversationMutation = useDeleteConversationMutation();
  const conversations = conversationsQuery.data ?? [];
  const clearActionError = useChatStore((state) => state.clearActionError);
  const closeDeleteDialog = useChatStore((state) => state.closeDeleteDialog);
  const closeRenameDialog = useChatStore((state) => state.closeRenameDialog);
  const conversationToDeleteId = useChatStore((state) => state.conversationToDeleteId);
  const conversationToRenameId = useChatStore((state) => state.conversationToRenameId);
  const renameTitle = useChatStore((state) => state.renameTitle);
  const setActionError = useChatStore((state) => state.setActionError);
  const setRenameTitle = useChatStore((state) => state.setRenameTitle);
  const conversationToDelete =
    conversations.find((conversation) => conversation.id === conversationToDeleteId) ?? null;
  const conversationToRename =
    conversations.find((conversation) => conversation.id === conversationToRenameId) ?? null;
  const deleteConversationTitle = conversationToDelete?.title ?? '该会话';

  const renameConversation = async () => {
    if (!conversationToRenameId) {
      return;
    }

    const title = renameTitle.trim();

    if (!title || title === conversationToRename?.title) {
      closeRenameDialog();
      return;
    }

    clearActionError();

    try {
      const conversation = await renameConversationMutation.mutateAsync({
        id: conversationToRenameId,
        title,
      });

      setConversationsCache(queryClient, (current) =>
        current.map((item) => (item.id === conversationToRenameId ? conversation : item)),
      );
      closeRenameDialog();
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '重命名失败');
    }
  };

  const handleRenameSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void renameConversation();
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) {
      closeDeleteDialog();
      return;
    }

    clearActionError();

    try {
      await deleteConversationMutation.mutateAsync(conversationToDelete.id);

      const next = conversations.filter((item) => item.id !== conversationToDelete.id);
      setConversationsCache(queryClient, () => next);
      queryClient.removeQueries({ queryKey: messageKeys.detail(conversationToDelete.id) });

      if (activeId === conversationToDelete.id) {
        if (next[0]) {
          void navigate(`/chat/${next[0].id}`);
        } else {
          void navigate('/chat');
        }
      }
    } catch (reason) {
      setActionError(reason instanceof Error ? reason.message : '删除失败');
    } finally {
      closeDeleteDialog();
    }
  };

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            closeRenameDialog();
          }
        }}
        open={Boolean(conversationToRenameId)}
      >
        <DialogContent>
          <form className="grid gap-4" onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>重命名会话</DialogTitle>
              <DialogDescription>修改会话在侧栏中显示的名称。</DialogDescription>
            </DialogHeader>
            <Input
              onChange={(event) => setRenameTitle(event.target.value)}
              placeholder="会话名称"
              value={renameTitle}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  取消
                </Button>
              </DialogClose>
              <Button disabled={!renameTitle.trim()} type="submit">
                保存
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            closeDeleteDialog();
          }
        }}
        open={Boolean(conversationToDeleteId)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              {`将永久删除「${deleteConversationTitle}」及其中的所有消息，此操作无法撤销。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={() => void confirmDeleteConversation()}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
