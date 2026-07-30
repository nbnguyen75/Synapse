import { createFileRoute, stripSearchParams } from '@tanstack/react-router';

import {
  DEFAULT_NOTES_QUERY_PARAMS,
  VIEW_FILTERS,
} from '@/features/notes/constants';
import { notesQueryParamsSchema } from '@/features/notes/schemas';
import { NotesViewPage } from '@/features/notes/components';

import { createTitle } from '@/config/metadata';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/favorites')({
  head: () => ({
    meta: [{ title: createTitle(m.favorites_page_title()) }],
  }),
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  staticData: {
    breadcrumb: () => m.sidebar_favorites(),
  },
  validateSearch: notesQueryParamsSchema,
  component: FavoritesPage,
});

function FavoritesPage() {
  const search = Route.useSearch();

  return (
    <NotesViewPage
      viewMode="favorites"
      search={search}
      apiFilters={VIEW_FILTERS.favorites}
    />
  );
}
