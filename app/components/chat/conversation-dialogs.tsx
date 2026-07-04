import type { Conversation } from '@contracts/models';

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

type ConversationDialogsProps = {
  conversationToDelete: Conversation | null;
  conversationToRename: Conversation | null;
  renameTitle: string;
  onCloseDelete: () => void;
  onCloseRename: () => void;
  onConfirmDelete: () => void;
  onRenameTitleChange: (value: string) => void;
  onRenameSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export function ConversationDialogs({
  conversationToDelete,
  conversationToRename,
  renameTitle,
  onCloseDelete,
  onCloseRename,
  onConfirmDelete,
  onRenameTitleChange,
  onRenameSubmit,
}: ConversationDialogsProps) {
  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            onCloseRename();
          }
        }}
        open={Boolean(conversationToRename)}
      >
        <DialogContent>
          <form className="grid gap-4" onSubmit={onRenameSubmit}>
            <DialogHeader>
              <DialogTitle>重命名会话</DialogTitle>
              <DialogDescription>修改会话在侧栏中显示的名称。</DialogDescription>
            </DialogHeader>
            <Input
              onChange={(event) => onRenameTitleChange(event.target.value)}
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
            onCloseDelete();
          }
        }}
        open={Boolean(conversationToDelete)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除会话？</AlertDialogTitle>
            <AlertDialogDescription>
              将永久删除「{conversationToDelete?.title}」及其中的所有消息，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: 'destructive' })}
              onClick={onConfirmDelete}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
