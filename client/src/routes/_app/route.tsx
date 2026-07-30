import type { PanelImperativeHandle } from 'react-resizable-panels';

import { useCallback, useEffect, useRef } from 'react';

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { CommandPalette } from '@/features/command-palette/components';

import { useSettingsStore } from '@/store/settings-store';

import { ConfirmProvider } from '@/providers/confirm-provider';

import {
  AppLeftSidebar,
  AppRightSidebar,
  AppTopHeader,
} from '@/components/layouts';

import {
  SidebarInset,
  SidebarManager,
  SidebarManagerProvider,
  SidebarProvider,
} from '@/components/ui/sidebar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location, context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        search: {
          redirect: location.href,
        },
        to: '/login',
      });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const { setRightSidebarOpen, rightSidebar } = useSettingsStore();

  const toggleRightSidebar = useCallback(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
      setRightSidebarOpen(true);
    } else {
      panel.collapse();
      setRightSidebarOpen(false);
    }
  }, [setRightSidebarOpen]);

  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    if (rightSidebar.open && panel.isCollapsed()) {
      panel.expand();
    } else if (!rightSidebar.open && !panel.isCollapsed()) {
      panel.collapse();
    }
  }, [rightSidebar.open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleRightSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRightSidebar]);

  return (
    <>
      <CommandPalette />

      <SidebarManagerProvider>
        <SidebarProvider className="h-svh overflow-hidden">
          <SidebarManager name="left">
            <AppLeftSidebar variant="inset" />
          </SidebarManager>

          <SidebarInset>
            <SidebarProvider defaultOpen={false}>
              <ResizablePanelGroup
                orientation="horizontal"
                className="overflow-hidden max-h-svh"
              >
                <ResizablePanel className="flex flex-col h-full overflow-hidden bg-background">
                  <AppTopHeader />

                  <main className="overflow-hidden flex-1 p-3">
                    <ConfirmProvider>
                      <Outlet />
                    </ConfirmProvider>
                  </main>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel
                  panelRef={rightPanelRef}
                  collapsible={true}
                  defaultSize="30%"
                  minSize="30%"
                  maxSize="55%"
                  className="no-scrollbar transition-[flex-grow,flex-basis] duration-200 ease-linear"
                >
                  <AppRightSidebar className="no-scrollbar w-full" />
                </ResizablePanel>
              </ResizablePanelGroup>
            </SidebarProvider>
          </SidebarInset>
        </SidebarProvider>
      </SidebarManagerProvider>
    </>
  );
}
