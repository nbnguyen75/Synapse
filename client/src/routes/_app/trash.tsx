import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import {
  DEFAULT_NOTES_QUERY_PARAMS,
  VIEW_FILTERS,
} from '@/features/notes/constants';
import { useEmptyTrashMutation } from '@/features/notes/hooks/use-note-mutation';
import { notesQueryParamsSchema } from '@/features/notes/schemas';
import { NotesViewPage } from '@/features/notes/components';

import { useConfirm } from '@/providers/confirm-provider';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/trash')({
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  head: () => ({
    meta: [{ title: createTitle(m.trash_page_title()) }],
  }),
  staticData: {
    breadcrumb: () => m.sidebar_trash(),
  },
  validateSearch: notesQueryParamsSchema,
  component: TrashPage,
});

function TrashPage() {
  const search = Route.useSearch();
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

    if (!ok) return;

    emptyTrash();
  };

  return (
    <NotesViewPage
      viewMode="trash"
      search={search}
      apiFilters={VIEW_FILTERS.trash}
      onEmptyTrash={handleEmptyTrash}
    />
  );
}
