import type { PatchNoteRequest, PatchNoteResponse } from '@/features/notes/api/notes.http';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import { patchNoteClient } from '@/features/notes/api/notes.http';
import { noteKeys } from '@/features/notes/api/notes.api';

export function useRestoreNote() {
  const queryClient = useQueryClient();

  return useMutation<PatchNoteResponse, Error, PatchNoteRequest>({
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      toast.success(m.notes_page_toast_restored(), {
        description: m.notes_page_toast_restored_desc({ title: data.title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_restore_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: patchNoteClient,
  });
}
