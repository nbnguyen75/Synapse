import type { Note } from '@/features/notes/types';

import {
   AlertDialog,
   AlertDialogAction,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogDescription,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogFooter,
} from '@/shared/components/ui/alert-dialog';

import { m } from '@/paraglide/messages';

interface DeleteAlertDialogProps {
   onOpenChange: (open: boolean) => void;
   deleteTarget: Note | null;
   onConfirm: () => void;
}

export function DeleteAlertDialog({
   deleteTarget,
   onOpenChange,
   onConfirm,
}: DeleteAlertDialogProps) {
   return (
      <AlertDialog
         open={!!deleteTarget}
         onOpenChange={(open) => {
            if (!open) onOpenChange(false);
         }}
      >
         <AlertDialogContent>
            <AlertDialogHeader>
               <AlertDialogTitle>
                  {m.notes_page_delete_title()}
               </AlertDialogTitle>
               <AlertDialogDescription>
                  {m.notes_page_delete_desc({
                     title: deleteTarget?.title ?? '',
                  })}
               </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
               <AlertDialogCancel onClick={() => onOpenChange(false)}>
                  {m.notes_page_delete_cancel()}
               </AlertDialogCancel>
               <AlertDialogAction variant="destructive" onClick={onConfirm}>
                  {m.notes_page_delete_confirm()}
               </AlertDialogAction>
            </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
