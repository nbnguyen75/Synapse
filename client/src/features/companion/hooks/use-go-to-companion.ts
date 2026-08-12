import { useNavigate } from '@tanstack/react-router';

import { useSettingsStore } from '@/store/settings-store';

/**
 * Routes to the AI companion: navigates to `/chat` in chat mode, or opens the
 * right sidebar in agent mode (where `/chat` routes are guarded).
 */
export function useGoToCompanion() {
  const navigate = useNavigate();
  const { setRightSidebarOpen, layoutMode } = useSettingsStore();

  return () => {
    if (layoutMode === 'chat') {
      void navigate({ to: '/chat' });
    } else {
      setRightSidebarOpen(true);
    }
  };
}
