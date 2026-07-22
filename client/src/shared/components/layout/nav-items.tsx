import type { AppTab } from './types';

import {
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

import { LABEL_MAP, type NavItem } from './layout-data';

export function NavItems({
   onNavigate,
   activeTab,
   items,
   label,
}: {
   onNavigate: (tab: AppTab) => void;
   activeTab: AppTab;
   items: NavItem[];
   label: string;
}) {
   return (
      <SidebarGroup>
         <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">
            {label}
         </SidebarGroupLabel>
         <SidebarGroupContent>
            <SidebarMenu>
               {items.map((item) => {
                  const isActive = activeTab === item.tab;
                  return (
                     <SidebarMenuItem key={item.tab}>
                        <SidebarMenuButton
                           isActive={isActive}
                           onClick={() => onNavigate(item.tab)}
                           tooltip={LABEL_MAP[item.labelKey]()}
                           className="data-active:bg-violet-50 data-active:text-violet-600 dark:data-active:bg-violet-950/20 dark:data-active:text-violet-400 data-active:shadow-xs rounded-lg text-xs font-medium [&>svg]:data-active:text-violet-600 dark:[&>svg]:data-active:text-violet-400"
                        >
                           <item.icon className="size-4.5" />
                           <span>{LABEL_MAP[item.labelKey]()}</span>
                        </SidebarMenuButton>
                     </SidebarMenuItem>
                  );
               })}
            </SidebarMenu>
         </SidebarGroupContent>
      </SidebarGroup>
   );
}
