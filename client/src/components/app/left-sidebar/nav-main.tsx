import { useMemo } from 'react';

import { Link } from '@tanstack/react-router';

import { useCurrentPathname } from '@/hooks/use-pathname';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { FileTextIcon, StarIcon, ArchiveIcon, Trash2Icon } from 'lucide-react';

const navItems = [
  {
    activeColor: 'text-sky-600 dark:text-sky-400',
    label: () => m.sidebar_notes_short(),
    icon: FileTextIcon,
    href: '/notes',
  },
  {
    // Icon Ngôi sao thêm hiệu ứng fill khi active
    activeColor:
      'text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400',
    label: () => m.sidebar_favorites(),
    href: '/notes/favorites',
    icon: StarIcon,
  },
  {
    activeColor: 'text-purple-600 dark:text-purple-400',
    label: () => m.sidebar_archive(),
    href: '/notes/archive',
    icon: ArchiveIcon,
  },
  {
    activeColor: 'text-rose-600 dark:text-rose-400',
    label: () => m.sidebar_trash(),
    href: '/notes/trash',
    icon: Trash2Icon,
  },
] as const;

export default function NavMain() {
  const currentPath = useCurrentPathname();

  const activeMap = useMemo(() => {
    return navItems.reduce<Record<string, boolean>>((acc, item) => {
      acc[item.href] = currentPath === item.href;
      return acc;
    }, {});
  }, [currentPath]);

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{m.sidebar_knowledge()}</SidebarGroupLabel>
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
                      className={cn(
                        'size-4 transition-colors',
                        isActive && item.activeColor,
                      )}
                    />
                    <span>{item.label()}</span>
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
