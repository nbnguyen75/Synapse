import type { InferRequestType, InferResponseType } from '@/lib/fetch';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';
import { $fetch } from '@/lib/fetch';

import { noteKeys } from '@/features/notes/keys';

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)[':id']['$delete']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['$delete']>
  >({
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
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].$delete(args);

      return result.data;
    },
  });
}
