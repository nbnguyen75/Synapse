import type { AppTab } from './types';

import {
   Breadcrumb,
   BreadcrumbItem,
   BreadcrumbList,
   BreadcrumbPage,
} from '@/shared/components/ui/breadcrumb';
import { SidebarTrigger } from '@/shared/components/ui/sidebar';
import { Separator } from '@/shared/components/ui/separator';
import { Button } from '@/shared/components/ui/button';

import { ACTIVE_TAB_LABEL } from './layout-data';
import { ThemeToggle } from './theme-toggle';

import { PanelRightClose, PanelRightOpen } from 'lucide-react';

export function LayoutHeader({
   onToggleRightSidebar,
   rightSidebarOpen,
   activeTab,
}: {
   onToggleRightSidebar: () => void;
   rightSidebarOpen: boolean;
   activeTab: AppTab;
}) {
   return (
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
         <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
               <BreadcrumbList>
                  <BreadcrumbItem>
                     <BreadcrumbPage className="text-sm font-medium text-foreground">
                        {ACTIVE_TAB_LABEL[activeTab]()}
                     </BreadcrumbPage>
                  </BreadcrumbItem>
               </BreadcrumbList>
            </Breadcrumb>
         </div>
         <div className="flex-1" />
         <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleRightSidebar}
            className="text-muted-foreground"
         >
            {rightSidebarOpen ? (
               <PanelRightClose className="size-4" />
            ) : (
               <PanelRightOpen className="size-4" />
            )}
         </Button>
         <ThemeToggle />
      </header>
   );
}
