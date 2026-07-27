import { useMemo } from 'react';

import { Link, useMatchRoute } from '@tanstack/react-router';

import { useCurrentPathname } from '@/hooks/use-pathname';

import {
   SidebarGroup,
   SidebarGroupLabel,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/components/ui/sidebar';

import { ArchiveIcon, FileTextIcon, TagIcon, Settings } from 'lucide-react';

const navItems = [
   { icon: FileTextIcon, label: 'Notes', href: '/notes' },
   { label: 'Tags', href: '/tags', icon: TagIcon },
   { href: '/archived', label: 'Archived', icon: ArchiveIcon },
   { href: '/settings', label: 'Settings', icon: Settings },
] as const;

export default function NavMain() {
   const currentPath = useCurrentPathname();
   const matchRoute = useMatchRoute();

   const activeMap = useMemo(() => {
      return navItems.reduce<Record<string, boolean>>((acc, item) => {
         acc[item.href] = !!matchRoute({ to: item.href, fuzzy: true });
         return acc;
      }, {});
   }, [currentPath, matchRoute]);

   return (
      <SidebarGroup>
         <SidebarGroupLabel>Platform</SidebarGroupLabel>
         <SidebarMenu>
            {navItems.map((item) => {
               const Icon = item.icon;
               const isActive = activeMap[item.href];
               return (
                  <SidebarMenuItem key={item.href}>
                     <SidebarMenuButton
                        isActive={isActive}
                        render={
                           <Link to={item.href}>
                              <Icon
                                 className={`size-4 ${isActive ? 'text-violet-600 dark:text-violet-400' : ''}`}
                              />
                              <span>{item.label}</span>
                           </Link>
                        }
                     />
                  </SidebarMenuItem>
               );
            })}
         </SidebarMenu>
      </SidebarGroup>
   );
}
