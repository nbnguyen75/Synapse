import { Link } from '@tanstack/react-router';

import { m } from '@/paraglide/messages';

import KeyboardShortcutsDialog from '@/components/shared/sidebar-keyboard-shortcuts-dialog';
import ConfigPopover from '@/components/deprecated/sidebar-config-popover';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { Settings2, Keyboard, Settings } from 'lucide-react';

export default function NavSecondary() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <KeyboardShortcutsDialog>
              <SidebarMenuButton size="sm" className="text-xs font-medium">
                <Keyboard className="size-4" />
                <span>{m.sidebar_keyboard_shortcuts()}</span>
              </SidebarMenuButton>
            </KeyboardShortcutsDialog>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              className="text-xs font-medium"
              render={
                <Link to="/settings">
                  <Settings className="size-4" />
                  <span>{m.sidebar_settings()}</span>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
