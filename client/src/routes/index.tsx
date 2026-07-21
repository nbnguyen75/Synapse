import { createFileRoute, redirect } from '@tanstack/react-router';

import { DEFAULT_NOTES_SEARCH } from '@/routes/_app/notes';

export const Route = createFileRoute('/')({
   beforeLoad: () => {
      throw redirect({ search: DEFAULT_NOTES_SEARCH, to: '/notes' });
   },
});
