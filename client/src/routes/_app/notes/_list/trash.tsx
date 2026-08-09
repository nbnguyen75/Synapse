import { createFileRoute } from '@tanstack/react-router';

import { NotesViewPage } from '@/features/notes/components';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes/_list/trash')({
  head: () => ({
    meta: [{ title: createTitle(m.trash_page_title()) }],
  }),
  staticData: {
    breadcrumb: () => m.sidebar_trash(),
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <NotesViewPage viewMode="trash" />;
}
