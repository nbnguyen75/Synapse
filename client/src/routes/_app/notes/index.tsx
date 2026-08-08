import { createFileRoute } from '@tanstack/react-router';

import { NotesViewPage } from '@/features/notes/components';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes/')({
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_title()) }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <NotesViewPage viewMode="active" />;
}
