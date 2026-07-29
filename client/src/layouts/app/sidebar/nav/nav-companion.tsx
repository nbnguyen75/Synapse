import { m } from '@/paraglide/messages';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { MessageCirclePlus, History, Star } from 'lucide-react';

const companionItems = [
  { label: () => m.sidebar_new_chat(), icon: MessageCirclePlus, href: '/chat' },
  { label: () => m.sidebar_history(), icon: History, href: '#' },
  { label: () => m.sidebar_favourites(), icon: Star, href: '#' },
] as const;

export default function NavCompanion() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{m.sidebar_companion()}</SidebarGroupLabel>
      <SidebarMenu>
        {companionItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton className="w-full">
                <Icon className="size-4" />
                <span>{item.label()}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
