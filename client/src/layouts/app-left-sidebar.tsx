import { Link } from '@tanstack/react-router';

import { NavMain, NavCompanion, NavUser } from '@/layouts/nav';
import { NavSecondary } from '@/layouts/nav-secondary';

import { env } from '@/config/env';

import {
   SidebarHeader,
   SidebarContent,
   SidebarMenu,
   SidebarMenuItem,
   SidebarMenuButton,
   SidebarFooter,
   Sidebar,
} from '@/components/ui/sidebar';

export default function AppLeftSidebar({
   ...props
}: React.ComponentProps<typeof Sidebar>) {
   const { side: _, ...restProps } = props;

   return (
      <Sidebar side="left" {...restProps}>
         <SidebarHeader>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton
                     size="lg"
                     render={
                        <Link to="/">
                           <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                              <img
                                 src="/images/logo.png"
                                 width={32}
                                 height={32}
                              />
                           </div>
                           <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-medium">
                                 {env.VITE_APP_NAME}
                              </span>
                              <span className="truncate text-xs">
                                 AI-powered Knowledge Hub
                              </span>
                           </div>
                        </Link>
                     }
                  />
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarHeader>

         <SidebarContent>
            <NavMain />
            <NavCompanion />
            <NavSecondary />
         </SidebarContent>

         <SidebarFooter>
            <NavUser />
         </SidebarFooter>
      </Sidebar>
   );
}
