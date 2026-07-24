import { Link, useMatchRoute } from '@tanstack/react-router';
import { useMemo } from 'react';

import { useCurrentPathname } from '@/shared/hooks/use-pathname';

import {
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from '@/shared/components/ui/sidebar';

import {
   ArchiveIcon,
   FileTextIcon,
   MessageSquareIcon,
   TagIcon,
} from 'lucide-react';

const navItems = [
   { icon: FileTextIcon, label: 'Notes', href: '/notes' },
   { icon: MessageSquareIcon, label: 'Sebastian', href: '/chat' },
   { label: 'Tags', href: '/tags', icon: TagIcon },
   // { href: 'copilot', label: 'AI Copilot', icon: BotIcon },
   { href: '/archived', label: 'Archived', icon: ArchiveIcon },
] as const;

export default function NavMain() {
   const currentPath = useCurrentPathname();
   const matchRoute = useMatchRoute();

   const activeMap = useMemo(() => {
      return navItems.reduce<Record<string, boolean>>((acc, item) => {
         acc[item.href] = !!matchRoute({ to: item.href, fuzzy: true });
         return acc;
      }, {});
   }, [currentPath]);

   return (
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
                              className={`h-4.5 w-4.5 ${isActive ? 'text-violet-600 dark:text-violet-400' : 'text-neutral-600 dark:text-neutral-400'}`}
                           />
                           <span className="truncate">{item.label}</span>
                        </Link>
                     }
                  ></SidebarMenuButton>
               </SidebarMenuItem>
            );
         })}
      </SidebarMenu>
   );
}
