import type { Note } from '@/features/notes/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { deleteNote } from '@/features/notes/api';

import { m } from '@/paraglide/messages';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';

interface DeleteAlertDialogProps {
  onOpenChange: (open: boolean) => void;
  note: Note | null;
}

export function DeleteAlertDialog({
  onOpenChange,
  note,
}: DeleteAlertDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notes'] });
      const prev = queryClient.getQueryData<Note[]>(['notes']);
      queryClient.setQueryData<Note[]>(['notes'], (old) =>
        (old || []).filter((n) => n.id !== id),
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      queryClient.setQueryData(['notes'], ctx?.prev);
      toast.error(m.notes_page_toast_delete_failed());
    },
    onSuccess: () => {
      toast.success(m.notes_page_toast_deleted(), {
        description: m.notes_page_toast_deleted_desc(),
      });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['notes'] }),
    mutationFn: (id: string) => deleteNote(id),
  });

  return (
    <AlertDialog
      open={!!note}
      onOpenChange={(open) => {
        if (!open) onOpenChange(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{m.notes_page_delete_title()}</AlertDialogTitle>
          <AlertDialogDescription>
            {m.notes_page_delete_desc({
              title: note?.title ?? '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            {m.notes_page_delete_cancel()}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              if (note) deleteMutation.mutate(note.id);
            }}
          >
            {m.notes_page_delete_confirm()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
