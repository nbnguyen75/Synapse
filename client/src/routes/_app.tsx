import type { PanelImperativeHandle } from 'react-resizable-panels';

import { createFileRoute, Outlet } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';

import { CommandPalette } from '@/features/command';

import {
   SidebarInset,
   SidebarManager,
   SidebarManagerProvider,
   SidebarProvider,
} from '@/shared/components/ui/sidebar';
import {
   ResizableHandle,
   ResizablePanel,
   ResizablePanelGroup,
} from '@/shared/components/ui/resizable';

import { AppLeftSidebar, AppRightSidebar, AppTopHeader } from '@/core/layouts';
import { TOGGLE_RIGHT_SIDEBAR_EVENT_NAME } from '@/shared/constants/event';

export const Route = createFileRoute('/_app')({
   component: AppLayout,
});

function AppLayout() {
   const rightPanelRef = useRef<PanelImperativeHandle>(null);

   useEffect(() => {
      const handleToggle = () => {
         const panel = rightPanelRef.current;
         if (!panel) return;

         if (panel.isCollapsed()) {
            panel.expand();
         } else {
            panel.collapse();
         }
      };

      window.addEventListener(TOGGLE_RIGHT_SIDEBAR_EVENT_NAME, handleToggle);
      return () =>
         window.removeEventListener(
            TOGGLE_RIGHT_SIDEBAR_EVENT_NAME,
            handleToggle,
         );
   }, []);

   return (
      <>
         <CommandPalette />

         <SidebarManagerProvider>
            <SidebarProvider className="h-svh overflow-hidden">
               {/* Left sidebar */}
               <SidebarManager name="left">
                  <AppLeftSidebar variant="inset" />
               </SidebarManager>

               <SidebarInset>
                  <SidebarProvider>
                     <ResizablePanelGroup
                        orientation="horizontal"
                        className="overflow-hidden max-h-svh"
                     >
                        <ResizablePanel className="flex flex-col h-full overflow-hidden bg-background">
                           <AppTopHeader />
                           <main className="overflow-hidden p-3">
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
