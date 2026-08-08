import { createFileRoute } from '@tanstack/react-router';

import TagsPage from '@/features/deprecated/tags/components/tags-page';

export const Route = createFileRoute('/_app/tags')({
  component: TagsPage,
});
