import type { BulkNoteAction } from '@/features/notes/constants';

import { useBulkActionsMutation } from '@/features/notes/hooks/use-note-mutation';

import { useConfirm } from '@/providers/confirm-provider';

import { m } from '@/paraglide/messages';

export function useNotesBulkActions(
  selectedIds: Set<string>,
  clearSelection: () => void,
) {
  const confirm = useConfirm();
  const { mutate: executeBulkAction } = useBulkActionsMutation();

  const handleBulkAction = async (action: BulkNoteAction) => {
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

    executeBulkAction(
      { body: { ids: [...selectedIds], action } },
      { onSuccess: clearSelection },
    );
  };

  return { handleBulkAction };
}
