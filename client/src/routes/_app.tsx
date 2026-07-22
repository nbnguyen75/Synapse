import type { AppTab } from '@/shared/components/layout/types';

import {
   createFileRoute,
   Outlet,
   useLocation,
   useNavigate,
} from '@tanstack/react-router';
import { useState } from 'react';

import { WorkspacePanel } from '@/features/workspace/workspace-panel';

import { SidebarUserMenu } from '@/shared/components/layout/sidebar-user-menu';
import { NavSecondary } from '@/shared/components/layout/nav-secondary';
import { LayoutHeader } from '@/shared/components/layout/layout-header';
import { SidebarLogo } from '@/shared/components/layout/sidebar-logo';
import { NAV_ITEMS } from '@/shared/components/layout/layout-data';
import { NavItems } from '@/shared/components/layout/nav-items';

import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarHeader,
   SidebarInset,
   SidebarProvider,
   SidebarSeparator,
} from '@/shared/components/ui/sidebar';

import { useSettingsStore } from '@/store/settings-store';

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
   const { setSidebarOpen, sidebar } = useSettingsStore();
   const [rightSidebarOpen, setRightSidebarOpen] = useState(() => {
      const saved = localStorage.getItem('synapse_right_sidebar_open');
      return saved !== 'false';
   });

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

   const toggleRightSidebar = () => setRightSidebarOpen((prev) => !prev);

   const navItems = NAV_ITEMS.filter((i) => i.group === 'navigation');
   const mgmtItems = NAV_ITEMS.filter((i) => i.group === 'management');

   return (
      <SidebarProvider open={sidebar.open} onOpenChange={setSidebarOpen}>
         <Sidebar variant="inset">
            <SidebarHeader className="h-16 items-center px-6 border-b border-neutral-100 dark:border-neutral-900/60">
               <SidebarLogo />
            </SidebarHeader>

            <SidebarSeparator />

            <SidebarContent>
               <NavItems
                  onNavigate={handleNavigate}
                  activeTab={activeTab}
                  items={navItems}
                  label="Navigation"
               />
               <NavItems
                  onNavigate={handleNavigate}
                  activeTab={activeTab}
                  items={mgmtItems}
                  label="Management"
               />
               <NavSecondary />
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
               <SidebarUserMenu />
            </SidebarFooter>
         </Sidebar>
         <SidebarInset>
            <LayoutHeader
               rightSidebarOpen={rightSidebarOpen}
               onToggleRightSidebar={toggleRightSidebar}
               activeTab={activeTab}
            />
            <div className="flex-1 overflow-auto">
               <Outlet />
            </div>
         </SidebarInset>
         <WorkspacePanel
            isOpen={rightSidebarOpen}
            onToggle={toggleRightSidebar}
         />
      </SidebarProvider>
   );
}
