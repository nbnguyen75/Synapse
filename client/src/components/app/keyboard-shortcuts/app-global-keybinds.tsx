import { useNavigate } from '@tanstack/react-router';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';

import { useCompanionStore } from '@/store/companion-store';
import { useSettingsStore } from '@/store/settings-store';

import { useTheme } from '@/providers/theme-provider';

import { useSidebarManager } from '@/components/ui/sidebar';

export default function AppGlobalKeybinds() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  const { use: useSidebar } = useSidebarManager();

  const leftSidebar = useSidebar('left');

  const { setActiveConversationId, activeConversationId } = useCompanionStore((state) => state);

  const { layoutMode } = useSettingsStore();

  useHotkeyShortcut('go-to-notes', () => {
    void navigate({ to: '/notes' });
    leftSidebar?.setOpenMobile(false);

    if (layoutMode === 'chat' && activeConversationId) {
      setActiveConversationId(null);
    }
  });

  useHotkeyShortcut('go-to-create-note', () => {
    void navigate({ to: '/notes/create' });
    leftSidebar?.setOpenMobile(false);

    if (layoutMode === 'chat' && activeConversationId) {
      setActiveConversationId(null);
    }
  });

  useHotkeyShortcut('toggle-theme', () => {
    toggleTheme();
  });

  useHotkeyShortcut('focus-search', () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  });

  useHotkeyShortcut('show-keyboard-shortcuts', () => {
    window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts-dialog'));
  });

  return null;
}
