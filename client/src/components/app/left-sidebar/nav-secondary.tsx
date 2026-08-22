import { Link } from '@tanstack/react-router';

import { m } from '@/paraglide/messages';

import KeyboardShortcutsDialog from '@/components/shared/sidebar-keyboard-shortcuts-dialog';
import { KeyCombo } from '@/components/shared';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

import { KeyboardIcon, SettingsIcon } from 'lucide-react';

export default function NavSecondary() {
  return (
    <SidebarGroup className="mt-auto">
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <KeyboardShortcutsDialog>
              <SidebarMenuButton size="sm" className="text-xs font-medium">
                <KeyboardIcon className="size-4" />
                <span>{m.sidebar_keyboard_shortcuts()}</span>

                <KeyCombo combo="mod+/" className="ml-auto" />
              </SidebarMenuButton>
            </KeyboardShortcutsDialog>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              size="sm"
              className="text-xs font-medium"
              render={
                <Link to="/settings">
                  <SettingsIcon className="size-4" />
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
