import { useNavigate } from '@tanstack/react-router';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';

import { useTheme } from '@/providers/theme-provider';

export default function AppGlobalKeybinds() {
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();

  useHotkeyShortcut('go-to-notes', () => {
    navigate({ to: '/notes' });
  });

  useHotkeyShortcut('go-to-create-note', () => {
    navigate({ to: '/notes/create' });
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
