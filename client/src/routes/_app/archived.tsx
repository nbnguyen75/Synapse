import { createFileRoute } from '@tanstack/react-router';

import ArchivedPage from '@/features/notes/components/archived-page';

export const Route = createFileRoute('/_app/archived')({
   component: ArchivedPage,
});
