import { useMutation, useQueryClient, type MutateOptions } from '@tanstack/react-query';

import { toast } from 'sonner';

import { useConfirm } from '@/providers/confirm-provider';

import { $fetch, type InferRequestType, type InferResponseType } from '@/lib/fetch';
import { m } from '@/paraglide/messages';

import { noteKeys } from '@/features/notes/keys';

type RequestType = InferRequestType<typeof $fetch.api.v1.notes.trash.$delete>;
type ResponseType = InferResponseType<typeof $fetch.api.v1.notes.trash.$delete>['data'];

export function useEmptyTrash(options: MutateOptions<ResponseType, Error, RequestType> = {}) {
  const confirm = useConfirm();

  const queryClient = useQueryClient();
  const {
    mutateAsync: _,
    mutate,
    ...restProps
  } = useMutation<ResponseType, Error, RequestType>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      toast.success(m.notes_page_toast_empty_trash());
    },
    onError: () => {
      toast.error(m.notes_page_toast_empty_trash_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: async () => {
      const result = await $fetch.api.v1.notes.trash.$delete();

      return result.data;
    },
  });

  const executeEmptyTrash = async () => {
    const ok = await confirm({
      description: m.trash_page_empty_confirm_desc(),
      title: m.trash_page_empty_confirm_title(),
      cancelText: m.notes_batch_cancel(),
      confirmText: m.trash_page_empty(),
      variant: 'destructive',
    });

    if (ok) {
      return mutate(undefined, options);
    }
  };

  return { executeEmptyTrash, ...restProps };
}
