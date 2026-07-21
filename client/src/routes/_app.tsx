import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';

import { AppLayout, type AppTab } from '@/components/layouts/app-layout';

export const Route = createFileRoute('/_app')({
   component: RouteComponent,
});

const TAB_ROUTES: Record<AppTab, string> = {
   archived: '/notes',
   notes: '/notes',
   chat: '/chat',
   tags: '/tags',
};

function RouteComponent() {
   const navigate = useNavigate();

   const handleNavigate = (tab: AppTab) => {
      void navigate({ to: TAB_ROUTES[tab] });
   };

   return (
      <AppLayout activeTab="notes" onNavigate={handleNavigate}>
         <Outlet />
      </AppLayout>
   );
}
