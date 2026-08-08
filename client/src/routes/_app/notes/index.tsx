import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';
import { notesQueryParamsSchema } from '@/features/notes/schemas';
import { NotesViewPage } from '@/features/notes/components';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes/')({
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  head: () => ({
    meta: [{ title: createTitle(m.notes_page_title()) }],
  }),
  validateSearch: notesQueryParamsSchema,
  component: RouteComponent,
});

function RouteComponent() {
  return <NotesViewPage viewMode="active" />;
}
