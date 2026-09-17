import type {
  BulkNoteActionsRequest,
  BulkNoteActionsResponse,
} from '@/features/notes/api/notes.http';
import type { BulkNoteAction } from '@/features/notes/constants';
import type { MutateOptions } from '@tanstack/react-query';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { useConfirm } from '@/providers/use-confirm';

import { m } from '@/paraglide/messages';

import { bulkNoteActionsClient } from '@/features/notes/api/notes.http';
import { noteKeys } from '@/features/notes/api/notes.api';

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

  handler();
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

  handler();
}

export function useNotesBulkAction(
  selectedIds: Set<string>,
  options: MutateOptions<BulkNoteActionsResponse, Error, BulkNoteActionsRequest> = {},
) {
  const confirm = useConfirm();

  const queryClient = useQueryClient();
  const {
    mutateAsync: _,
    mutate,
    ...restProps
  } = useMutation<BulkNoteActionsResponse, Error, BulkNoteActionsRequest>({
    onSuccess: (_, { body: { action } }) => {
      void queryClient.invalidateQueries({ queryKey: noteKeys.all });

      showBulkNoteActionSuccessToast(action);
    },
    mutationFn: bulkNoteActionsClient,
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
