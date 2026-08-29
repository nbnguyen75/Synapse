import type { PanelImperativeHandle } from 'react-resizable-panels';

import { useCallback, useEffect, useRef } from 'react';

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { CommandPalette } from '@/features/command-palette/components';

import { useHotkeyShortcut } from '@/hooks/use-hotkey-shortcut';
import { useIsMobile } from '@/hooks/use-mobile';

import { useSettingsStore } from '@/store/settings-store';

import { AppGlobalKeybinds } from '@/components/app/keyboard-shortcuts';
import { AppRightSidebar } from '@/components/app/right-sidebar';
import { AppLeftSidebar } from '@/components/app/left-sidebar';
import { AppTopHeader } from '@/components/app/header';

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
import { Sheet, SheetContent } from '@/components/ui/sheet';

import { ConfirmProvider } from '@/providers';

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
  preloadStaleTime: 1000 * 60 * 5,
  component: AppLayout,
});

function AppLayout() {
  const rightPanelRef = useRef<PanelImperativeHandle>(null);
  const { setRightSidebarOpen, setLayoutMode, rightSidebar, layoutMode } =
    useSettingsStore();
  const isMobile = useIsMobile();

  const toggleRightSidebar = useCallback(() => {
    if (layoutMode === 'chat') {
      setLayoutMode('agent');
      return;
    }
    if (isMobile) {
      setRightSidebarOpen(!rightSidebar.open);
      return;
    }
    const panel = rightPanelRef.current;
    if (!panel) return;

    if (panel.isCollapsed()) {
      panel.expand();
      setRightSidebarOpen(true);
    } else {
      panel.collapse();
      setRightSidebarOpen(false);
    }
  }, [
    isMobile,
    layoutMode,
    rightSidebar.open,
    setLayoutMode,
    setRightSidebarOpen,
  ]);

  useEffect(() => {
    const panel = rightPanelRef.current;
    if (!panel) return;

    const collapsed = layoutMode === 'chat' || !rightSidebar.open;
    if (collapsed && !panel.isCollapsed()) {
      panel.collapse();
    } else if (!collapsed && panel.isCollapsed()) {
      panel.expand();
    }
  }, [layoutMode, rightSidebar.open]);

  useHotkeyShortcut('toggle-right-sidebar', () => {
    toggleRightSidebar();
  });

  const rightPanelOpen = layoutMode === 'agent' && rightSidebar.open;

  return (
    <ConfirmProvider>
      <CommandPalette />

      <SidebarManagerProvider>
        <AppGlobalKeybinds />

        <SidebarProvider className="h-svh overflow-hidden">
          <SidebarManager name="left">
            <AppLeftSidebar variant="inset" />
          </SidebarManager>

          <SidebarInset>
            {isMobile ? (
              <>
                <div className="flex h-full w-full flex-col overflow-hidden bg-background">
                  <AppTopHeader />

                  <main className="overflow-y-auto min-h-0 flex-1 p-3">
                    <Outlet />
                  </main>
                </div>

                <Sheet open={rightPanelOpen} onOpenChange={setRightSidebarOpen}>
                  <SheetContent
                    side="right"
                    showCloseButton={false}
                    className="data-[side=right]:w-full data-[side=right]:sm:max-w-full border-l bg-sidebar p-0 text-sidebar-foreground"
                  >
                    <AppRightSidebar />
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <ResizablePanelGroup
                orientation="horizontal"
                className="overflow-hidden max-h-svh"
              >
                <ResizablePanel className="flex flex-col h-full overflow-hidden bg-background">
                  <AppTopHeader />

                  <main className="overflow-y-auto min-h-0 flex-1 p-3">
                    <Outlet />
                  </main>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel
                  panelRef={rightPanelRef}
                  collapsible={true}
                  defaultSize="30%"
                  minSize="30%"
                  maxSize="55%"
                  className="no-scrollbar transition-[flex-grow,flex-basis] duration-300 ease-in-out"
                >
                  <AppRightSidebar className="no-scrollbar w-full" />
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </SidebarInset>
        </SidebarProvider>
      </SidebarManagerProvider>
    </ConfirmProvider>
  );
}
