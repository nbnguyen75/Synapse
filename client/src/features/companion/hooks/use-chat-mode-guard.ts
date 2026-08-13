import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useSettingsStore } from '@/store/settings-store';

/**
 * Redirects away from chat routes when the layout mode is no longer `'chat'`.
 * The route `beforeLoad` guards only run on load, so toggling back to agent
 * mode while mounted on `/chat` needs this reactive guard.
 */
export function useChatModeGuard() {
  const navigate = useNavigate();
  const layoutMode = useSettingsStore((state) => state.layoutMode);

  useEffect(() => {
    if (layoutMode !== 'chat') {
      void navigate({ to: '/notes' });
    }
  }, [layoutMode, navigate]);
}
