import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { readPersistedLayoutMode } from '@/store/settings-store';

export const Route = createFileRoute('/_app/chat')({
  beforeLoad: () => {
    if (readPersistedLayoutMode() !== 'chat') {
      throw redirect({ to: '/notes' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
