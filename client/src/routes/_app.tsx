import {
   createFileRoute,
   Outlet,
   useLocation,
   useNavigate,
} from '@tanstack/react-router';

import { AppLayout, type AppTab } from '@/shared/components/layout/app-layout';

export const Route = createFileRoute('/_app')({
   component: RouteComponent,
});

const TAB_ROUTES: Record<AppTab, string> = {
   settings: '/settings',
   profile: '/profile',
   archived: '/notes',
   notes: '/notes',
   chat: '/chat',
   tags: '/tags',
};

function RouteComponent() {
   const navigate = useNavigate();
   const pathname = useLocation().pathname;

   const activeTab: AppTab =
      pathname === '/profile'
         ? 'profile'
         : pathname === '/settings'
           ? 'settings'
           : pathname === '/chat'
             ? 'chat'
             : pathname === '/tags'
               ? 'tags'
               : 'notes';

   const handleNavigate = (tab: AppTab) => {
      void navigate({ to: TAB_ROUTES[tab] });
   };

   return (
      <AppLayout activeTab={activeTab} onNavigate={handleNavigate}>
         <Outlet />
      </AppLayout>
   );
}
