import { createFileRoute } from '@tanstack/react-router';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { NotesListCardSkeleton, NotesViewPage } from '@/features/notes/components';
import { infiniteNotesQueryOptions, NOTE_VIEW_CONFIG } from '@/features/notes';

export const Route = createFileRoute('/_app/notes/_list/trash')({
  loaderDeps: ({ search }) => ({
    q: search.q,
    sort: search.sort,
    page: search.page,
    pageSize: search.pageSize,
  }),

  loader: async ({ context: { queryClient }, deps }) => {
    const { page, ...rest } = {
      ...deps,
      ...NOTE_VIEW_CONFIG.active.filters,
      sort: ['pinned,desc', deps.sort],
    };

    await queryClient.infiniteQuery({
      ...infiniteNotesQueryOptions(rest, page),
      staleTime: 'static',
    });
  },
  head: () => ({
    meta: [{ title: createTitle(m.trash_page_title()) }],
  }),
  staticData: {
    breadcrumb: () => m.sidebar_trash(),
  },
  pendingComponent: () => <NotesListCardSkeleton />,
  pendingMs: 150,
  pendingMinMs: 300,
  component: RouteComponent,
});

function RouteComponent() {
  return <NotesViewPage viewMode="trash" />;
}
