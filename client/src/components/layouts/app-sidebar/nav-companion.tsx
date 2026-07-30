import { useSettingsStore } from '@/store/settings-store';

import { m } from '@/paraglide/messages';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';

import {
  BotIcon,
  HistoryIcon,
  MessageCirclePlusIcon,
  MessageSquareIcon,
} from 'lucide-react';

const companionItems = [
  {
    label: () => m.sidebar_new_chat(),
    icon: MessageCirclePlusIcon,
    href: '/chat',
  },
  { label: () => m.sidebar_history(), icon: HistoryIcon, href: '#' },
] as const;

export default function NavCompanion() {
  const { setLayoutMode, layoutMode } = useSettingsStore();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{m.sidebar_ai_companion()}</SidebarGroupLabel>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            className="w-full"
            render={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {layoutMode === 'servant' ? (
                    <BotIcon className="h-4 w-4 shrink-0 text-primary" />
                  ) : (
                    <MessageSquareIcon className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  )}

                  <div className="flex flex-col">
                    <span className="font-medium text-foreground">
                      {layoutMode === 'servant'
                        ? m.sidebar_mode_servant()
                        : m.sidebar_mode_chat()}
                    </span>
                  </div>
                </div>

                <Switch
                  checked={layoutMode === 'chat'}
                  onCheckedChange={(checked) =>
                    setLayoutMode(checked ? 'chat' : 'servant')
                  }
                />
              </div>
            }
          />
        </SidebarMenuItem>

        {companionItems.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.label()}>
              <SidebarMenuButton className="w-full" disabled>
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
