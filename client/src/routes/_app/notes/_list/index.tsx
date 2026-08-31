import { createFileRoute } from '@tanstack/react-router';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

import { NotesViewPage } from '@/features/notes/components';

export const Route = createFileRoute('/_app/notes/_list/')({
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_title()) }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotesViewPage viewMode="active" />;
}
