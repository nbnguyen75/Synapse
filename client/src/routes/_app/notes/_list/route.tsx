import { createFileRoute, Outlet, stripSearchParams } from '@tanstack/react-router';

import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';
import { notesQueryParamsSchema } from '@/features/notes/schemas';
import { NoteCardSkeleton } from '@/features/notes/components';

const SKELETON_KEYS = [
  'skeleton-1',
  'skeleton-2',
  'skeleton-3',
  'skeleton-4',
  'skeleton-5',
  'skeleton-6',
];

export const Route = createFileRoute('/_app/notes/_list')({
  pendingComponent: () => (
    <div className="grid gap-4 grid-cols-1 @2xl:grid-cols-2 @6xl:grid-cols-3">
      {SKELETON_KEYS.map((key) => (
        <NoteCardSkeleton key={key} />
      ))}
    </div>
  ),
  validateSearch: notesQueryParamsSchema,
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  component: () => <Outlet />,
});
