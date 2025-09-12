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
import { useAppStore } from '@/store/useAppStore';

export function useConfirmDialogue() {
  const {
    isDialogueBoxOpen,
    setIsDialogueBoxOpen,
    dialogueResolver,
    setDialogueResolver,
  } = useAppStore();

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      setDialogueResolver(() => resolve);
      setIsDialogueBoxOpen(true);
    });

  const handleCancel = () => {
    dialogueResolver?.(false);
    setIsDialogueBoxOpen(false);
    setDialogueResolver(null);
  };

  const handleConfirm = () => {
    dialogueResolver?.(true);
    setIsDialogueBoxOpen(false);
    setDialogueResolver(null);
  };

  // TODO: create reusable dialogue box component
  const DialogueBox = (
    <AlertDialog
      open={isDialogueBoxOpen}
      onOpenChange={(open) => {
        setIsDialogueBoxOpen(open);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { confirm, DialogueBox };
}
