import { Link } from '@tanstack/react-router';

import { useCompanionStore } from '@/store/companion-store';
import { useSettingsStore } from '@/store/settings-store';

import { m } from '@/paraglide/messages';

import KeyboardShortcutsDialog from '@/components/shared/sidebar-keyboard-shortcuts-dialog';
import { KeyCombo } from '@/components/shared';

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebarManager,
} from '@/components/ui/sidebar';

import { KeyboardIcon, SettingsIcon } from 'lucide-react';

export default function NavSecondary() {
  const { use: useSidebar } = useSidebarManager();

  const leftSidebar = useSidebar('left');

  const { layoutMode } = useSettingsStore();

  const { setActiveConversationId, activeConversationId } = useCompanionStore(
    (state) => state,
  );

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
                <Link
                  to="/settings"
                  onClick={() => {
                    if (leftSidebar?.isMobile) {
                      leftSidebar?.setOpenMobile(false);
                    }

                    if (layoutMode === 'chat' && activeConversationId) {
                      setActiveConversationId(null);
                    }
                  }}
                >
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
