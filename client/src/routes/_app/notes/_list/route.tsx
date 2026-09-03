import { createFileRoute, Outlet, stripSearchParams } from '@tanstack/react-router';

import { DEFAULT_NOTES_QUERY_PARAMS } from '@/features/notes/constants';
import { notesQueryParamsSchema } from '@/features/notes/schemas';

export const Route = createFileRoute('/_app/notes/_list')({
  validateSearch: notesQueryParamsSchema,
  search: {
    middlewares: [stripSearchParams(DEFAULT_NOTES_QUERY_PARAMS)],
  },
  component: () => <Outlet />,
});
