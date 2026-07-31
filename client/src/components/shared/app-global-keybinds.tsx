import { useNavigate } from '@tanstack/react-router';

import { useKeyboardShortcut } from '@/hooks/use-key-binding';

import { getShortcut } from '@/config/keyboard-shortcuts';

export default function AppGlobalKeybinds() {
  const navigate = useNavigate();

  useKeyboardShortcut(getShortcut('new-note').combos, () => {
    navigate({ to: '/notes/create' });
  });

  useKeyboardShortcut(getShortcut('focus-search').combos, () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  });

  useKeyboardShortcut(getShortcut('show-keyboard-shortcuts').combos, () => {
    window.dispatchEvent(new CustomEvent('open-keyboard-shortcuts-dialog'));
  });

  return null;
}
