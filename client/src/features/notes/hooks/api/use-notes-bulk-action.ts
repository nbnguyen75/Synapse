import type { BulkNoteAction } from '@/features/notes/constants';

import {
  useMutation,
  useQueryClient,
  type MutateOptions,
} from '@tanstack/react-query';

import { toast } from 'sonner';

import { noteKeys } from '@/features/notes/keys';

import { useConfirm } from '@/providers/confirm-provider';

import {
  $fetch,
  type InferRequestType,
  type InferResponseType,
} from '@/lib/fetch';
import { m } from '@/paraglide/messages';

const SUCCESS_TOAST_MAP: Record<BulkNoteAction, () => void> = {
  DELETE_PERMANENT: () => toast.success(m.notes_page_toast_deleted()),
  UNFAVORITE: () => toast.success(m.notes_page_toast_unfavorited()),
  UNARCHIVE: () => toast.success(m.notes_page_toast_unarchived()),
  FAVORITE: () => toast.success(m.notes_page_toast_favorited()),
  ARCHIVE: () => toast.success(m.notes_page_toast_archived()),
  RESTORE: () => toast.success(m.notes_page_toast_restored()),
  UNPIN: () => toast.success(m.notes_page_toast_unpinned()),
  TRASH: () => toast.success(m.notes_page_toast_trashed()),
  PIN: () => toast.success(m.notes_page_toast_pinned()),
};

export function showBulkNoteActionSuccessToast(action: BulkNoteAction) {
  const handler = SUCCESS_TOAST_MAP[action];

  if (handler) handler();
}

const ERROR_TOAST_MAP: Record<BulkNoteAction, () => void> = {
  DELETE_PERMANENT: () =>
    toast.error(m.notes_page_toast_delete_failed(), {
      description: m.common_error_connection(),
    }),
  UNARCHIVE: () =>
    toast.error(m.notes_page_toast_unarchive_failed(), {
      description: m.common_error_connection(),
    }),
  UNFAVORITE: () =>
    toast.error(m.notes_page_toast_update_failed(), {
      description: m.common_error_connection(),
    }),
  ARCHIVE: () =>
    toast.error(m.notes_page_toast_archive_failed(), {
      description: m.common_error_connection(),
    }),
  FAVORITE: () =>
    toast.error(m.notes_page_toast_update_failed(), {
      description: m.common_error_connection(),
    }),
  RESTORE: () =>
    toast.error(m.notes_page_toast_restore_failed(), {
      description: m.common_error_connection(),
    }),
  UNPIN: () =>
    toast.error(m.notes_page_toast_update_failed(), {
      description: m.common_error_connection(),
    }),
  TRASH: () =>
    toast.error(m.notes_page_toast_trash_failed(), {
      description: m.common_error_connection(),
    }),
  PIN: () =>
    toast.error(m.notes_page_toast_update_failed(), {
      description: m.common_error_connection(),
    }),
};

export function showBulkNoteActionErrorToast(action: BulkNoteAction) {
  const handler = ERROR_TOAST_MAP[action];

  if (handler) handler();
}

type RequestType = InferRequestType<
  typeof $fetch.api.v1.notes.bulk.actions.$post
>;
type ResponseType = InferResponseType<
  typeof $fetch.api.v1.notes.bulk.actions.$post
>['data'];

export function useNotesBulkAction(
  selectedIds: Set<string>,
  options: MutateOptions<ResponseType, Error, RequestType> = {},
) {
  const confirm = useConfirm();

  const queryClient = useQueryClient();
  const {
    mutateAsync: _,
    mutate,
    ...restProps
  } = useMutation<ResponseType, Error, RequestType>({
    onSuccess: (_, { body: { action } }) => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all });

      showBulkNoteActionSuccessToast(action);
    },
    mutationFn: async (args) => {
      const result = await $fetch.api.v1.notes.bulk.actions.$post(args);

      return result.data;
    },
    onError: (_, { body: { action } }) => {
      showBulkNoteActionErrorToast(action);
    },
  });

  const executeBulkAction = async (action: BulkNoteAction) => {
    if (!selectedIds.size) return;

    if (action === 'DELETE_PERMANENT') {
      const ok = await confirm({
        description: m.trash_page_empty_confirm_desc(),
        confirmText: m.notes_bulk_delete_permanent(),
        title: m.trash_page_empty_confirm_title(),
        cancelText: m.notes_batch_cancel(),
        variant: 'destructive',
      });

      if (!ok) return;
    }

    mutate({ body: { ids: [...selectedIds], action } }, options);
  };

  return { executeBulkAction, ...restProps };
}
