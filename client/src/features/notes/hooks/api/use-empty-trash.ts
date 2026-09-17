import type {
  EmptyTrashNotesRequest,
  EmptyTrashNotesResponse,
} from '@/features/notes/api/notes.http';
import type { MutateOptions } from '@tanstack/react-query';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { useConfirm } from '@/providers/use-confirm';

import { m } from '@/paraglide/messages';

import { emptyTrashNotesClient } from '@/features/notes/api/notes.http';
import { noteKeys } from '@/features/notes/api/notes.api';

export function useEmptyTrash(
  options: MutateOptions<EmptyTrashNotesResponse, Error, EmptyTrashNotesRequest> = {},
) {
  const confirm = useConfirm();

  const queryClient = useQueryClient();
  const {
    mutateAsync: _,
    mutate,
    ...restProps
  } = useMutation<EmptyTrashNotesResponse, Error, EmptyTrashNotesRequest>({
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      toast.success(m.notes_page_toast_empty_trash());
    },
    onError: () => {
      toast.error(m.notes_page_toast_empty_trash_failed(), {
        description: m.common_error_connection(),
      });
    },
    mutationFn: emptyTrashNotesClient,
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
