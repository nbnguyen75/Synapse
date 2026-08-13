import { useNavigate } from '@tanstack/react-router';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';

export default function AppGlobalKeybinds() {
  const navigate = useNavigate();

  useHotkeyShortcut('go-to-create-note', () => {
    navigate({ to: '/notes/create' });
  });

  useHotkeyShortcut('focus-search', () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  });

  useHotkeyShortcut('show-keyboard-shortcuts', () => {
    window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts-dialog'));
  });

  return null;
}
