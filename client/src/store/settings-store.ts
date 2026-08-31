import type { LayoutMode } from '@/components/app/types';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SETTINGS_STORAGE_KEY = 'synapse-settings';

/**
 * Reads the persisted layout mode synchronously (e.g. in route `beforeLoad`
 * guards, where the store isn't available). Falls back to `'agent'`.
 */
export function readPersistedLayoutMode(): LayoutMode {
  if (typeof localStorage === 'undefined') return 'agent';
  const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!raw) return 'agent';
  try {
    const parsed = JSON.parse(raw) as { state?: { layoutMode?: LayoutMode } };
    return parsed.state?.layoutMode ?? 'agent';
  } catch {
    return 'agent';
  }
}

interface SidebarSettings {
  openMobile: boolean;
  open: boolean;
}

interface AppSettingsState {
  setSidebarOpenMobile: (open: boolean) => void;
  setRightSidebarOpen: (open: boolean) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setSidebarOpen: (open: boolean) => void;
  rightSidebar: { open: boolean };
  sidebar: SidebarSettings;
  layoutMode: LayoutMode;
}

export const useSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      setLayoutMode: (layoutMode) =>
        set((state) => ({
          rightSidebar: {
            open: layoutMode === 'agent' ? true : state.rightSidebar.open,
          },
          layoutMode,
        })),
      setSidebarOpenMobile: (openMobile) =>
        set((state) => ({
          sidebar: { ...state.sidebar, openMobile },
        })),
      setRightSidebarOpen: (open) =>
        set((state) => ({
          rightSidebar: { ...state.rightSidebar, open },
        })),
      setSidebarOpen: (open) =>
        set((state) => ({
          sidebar: { ...state.sidebar, open },
        })),
      sidebar: {
        openMobile: false,
        open: true,
      },
      rightSidebar: {
        open: false,
      },
      layoutMode: 'agent',
    }),
    {
      partialize: (state) => ({
        rightSidebar: state.rightSidebar,
        layoutMode: state.layoutMode,
        sidebar: state.sidebar,
      }),
      name: SETTINGS_STORAGE_KEY,
      version: 1,
    },
  ),
);
