import { useEmptyTrashMutation } from '@/features/notes/hooks/use-note-mutation';

import { useConfirm } from '@/providers/confirm-provider';

import { m } from '@/paraglide/messages';

export function useEmptyTrash(onSuccess?: () => void) {
  const confirm = useConfirm();
  const { mutate: emptyTrash } = useEmptyTrashMutation();

  const handleEmptyTrash = async () => {
    const ok = await confirm({
      description: m.trash_page_empty_confirm_desc(),
      title: m.trash_page_empty_confirm_title(),
      cancelText: m.notes_batch_cancel(),
      confirmText: m.trash_page_empty(),
      variant: 'destructive',
    });

    if (ok) {
      emptyTrash(undefined, { onSuccess });
    }
  };

  return { handleEmptyTrash };
}
