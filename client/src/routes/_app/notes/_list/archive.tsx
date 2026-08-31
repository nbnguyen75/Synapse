import { createFileRoute } from '@tanstack/react-router';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { NotesViewPage } from '@/features/notes/components';

export const Route = createFileRoute('/_app/notes/_list/archive')({
  head: () => ({
    meta: [{ title: createTitle(m.archive_page_title()) }],
  }),
  staticData: {
    breadcrumb: () => m.sidebar_archive(),
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <NotesViewPage viewMode="archive" />;
}
