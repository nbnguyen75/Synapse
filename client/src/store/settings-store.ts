import type { LayoutMode } from '@/layouts/types';

import { persist } from 'zustand/middleware';
import { create } from 'zustand';

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
      setLayoutMode: (layoutMode) =>
        set(() => ({
          layoutMode,
        })),
      sidebar: {
        openMobile: false,
        open: true,
      },
      rightSidebar: {
        open: true,
      },
      layoutMode: 'servant',
    }),
    {
      partialize: (state) => ({
        rightSidebar: state.rightSidebar,
        layoutMode: state.layoutMode,
        sidebar: state.sidebar,
      }),
      name: 'synapse-settings',
    },
  ),
);
