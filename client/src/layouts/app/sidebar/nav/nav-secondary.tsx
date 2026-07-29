import { m } from '@/paraglide/messages';

import {
  ConfigPopover,
  KeyboardShortcutsDialog,
} from '@/components/common/sidebar-config';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Settings2, Keyboard } from 'lucide-react';

export function NavSecondary() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <ConfigPopover>
              <SidebarMenuButton size="sm" className="text-xs font-medium">
                <Settings2 className="size-4" />
                <span>{m.sidebar_config()}</span>
              </SidebarMenuButton>
            </ConfigPopover>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <KeyboardShortcutsDialog>
              <SidebarMenuButton size="sm" className="text-xs font-medium">
                <Keyboard className="size-4" />
                <span>{m.sidebar_keyboard_shortcuts()}</span>
              </SidebarMenuButton>
            </KeyboardShortcutsDialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
