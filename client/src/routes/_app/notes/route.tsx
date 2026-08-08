import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from '@tanstack/react-router';

import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';
import { NoteCardSkeleton } from '@/features/notes/components';
import { notesQueryParamsSchema } from '@/features/notes';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes')({
  pendingComponent: () => (
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <NoteCardSkeleton key={i} />
      ))}
    </div>
  ),
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  staticData: {
    breadcrumb: () => m.notes_page_breadcrumb_notes(),
  },
  validateSearch: notesQueryParamsSchema,
  component: () => <Outlet />,
});
