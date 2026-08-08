import { createFileRoute } from '@tanstack/react-router';

import { NotesViewPage } from '@/features/notes/components';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes/archive')({
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
