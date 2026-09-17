import type { DeleteNoteRequest, DeleteNoteResponse } from '@/features/notes/api/notes.http';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import { deleteNoteClient } from '@/features/notes/api/notes.http';
import { noteKeys } from '@/features/notes/api/notes.api';

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation<DeleteNoteResponse, Error, DeleteNoteRequest>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      toast.success(m.notes_page_toast_deleted(), {
        description: m.notes_page_toast_deleted_desc(),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_delete_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: deleteNoteClient,
  });
}
