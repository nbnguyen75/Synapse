import { createFileRoute, Outlet } from '@tanstack/react-router';

import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/notes')({
  staticData: {
    breadcrumb: () => m.notes_page_breadcrumb_notes(),
  },
  component: () => <Outlet />,
});
