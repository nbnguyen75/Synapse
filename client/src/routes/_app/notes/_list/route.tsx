import {
  createFileRoute,
  Outlet,
  stripSearchParams,
} from '@tanstack/react-router';

import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';
import { notesQueryParamsSchema } from '@/features/notes/schemas';
import { NoteCardSkeleton } from '@/features/notes/components';

export const Route = createFileRoute('/_app/notes/_list')({
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
  validateSearch: notesQueryParamsSchema,
  component: () => <Outlet />,
});
