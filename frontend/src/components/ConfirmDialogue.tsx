import {
  confirmable,
  createConfirmation,
  type ConfirmDialogProps,
} from 'react-confirm';

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

// TODO: dynamic cancel and proceed messages as props

function ConfirmDialog({
  show,
  proceed,
  message,
  yesText,
  noText,
}: ConfirmDialogProps<
  { message: string; yesText?: string; noText?: string },
  boolean
>) {
  return (
    <AlertDialog open={show} onOpenChange={(open) => !open && proceed(false)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => proceed(false)}>
            {noText ? noText : 'No'}
          </AlertDialogCancel>
          <AlertDialogAction onClick={() => proceed(true)}>
            {yesText ? yesText : 'Yes'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const confirm = createConfirmation(confirmable(ConfirmDialog));
