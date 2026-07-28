import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { MessageCirclePlus, History, Star } from 'lucide-react';

const companionItems = [
  { icon: MessageCirclePlus, label: 'New Chat', href: '/chat' },
  { label: 'History', icon: History, href: '#' },
  { label: 'Favourites', icon: Star, href: '#' },
] as const;

export default function NavCompanion() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Companion</SidebarGroupLabel>
      <SidebarMenu>
        {companionItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton className="w-full">
                <Icon className="size-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
