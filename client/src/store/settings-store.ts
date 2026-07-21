import { persist } from 'zustand/middleware';
import { create } from 'zustand';

interface SidebarSettings {
   openMobile: boolean;
   open: boolean;
}

interface AppSettingsState {
   setSidebarOpenMobile: (open: boolean) => void;
   setSidebarOpen: (open: boolean) => void;
   sidebar: SidebarSettings;
}

export const useSettingsStore = create<AppSettingsState>()(
   persist(
      (set) => ({
         setSidebarOpenMobile: (openMobile) =>
            set((state) => ({
               sidebar: { ...state.sidebar, openMobile },
            })),
         setSidebarOpen: (open) =>
            set((state) => ({
               sidebar: { ...state.sidebar, open },
            })),
         sidebar: {
            openMobile: false,
            open: true,
         },
      }),
      {
         partialize: (state) => ({ sidebar: state.sidebar }),
         name: 'synapse-settings',
      },
   ),
);
