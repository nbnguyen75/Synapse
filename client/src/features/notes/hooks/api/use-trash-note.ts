import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { $fetch, type InferRequestType, type InferResponseType } from '@/lib/fetch';
import { m } from '@/paraglide/messages';

import { noteKeys } from '@/features/notes/keys';

export function useTrashNote() {
  const queryClient = useQueryClient();

  return useMutation<
    InferResponseType<(typeof $fetch.api.v1.notes)[':id']['$patch']>['data'],
    Error,
    InferRequestType<(typeof $fetch.api.v1.notes)[':id']['$patch']>
  >({
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      toast.success(m.notes_page_toast_trashed(), {
        description: m.notes_page_toast_trashed_desc({ title: data.title }),
      });
    },
    onError: () => {
      toast.error(m.notes_page_toast_trash_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes[':id'].$patch(args);

      return result.data;
    },
  });
}
