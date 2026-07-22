import {
   SidebarGroup,
   SidebarGroupContent,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

import { LifeBuoy } from 'lucide-react';

export function NavSecondary() {
   return (
      <SidebarGroup className="mt-auto">
         <SidebarGroupContent>
            <SidebarMenu>
               <SidebarMenuItem>
                  <SidebarMenuButton size="sm" className="text-xs font-medium">
                     <LifeBuoy className="size-4" />
                     <span>Support</span>
                  </SidebarMenuButton>
               </SidebarMenuItem>
            </SidebarMenu>
         </SidebarGroupContent>
      </SidebarGroup>
   );
}
