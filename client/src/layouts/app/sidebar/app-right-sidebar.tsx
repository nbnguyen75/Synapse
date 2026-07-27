import ChatBot from '@/features/chat/components/chat-bot';

import { useSettingsStore } from '@/store/settings-store';

import {
   SidebarHeader,
   SidebarContent,
   Sidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

import { XIcon } from 'lucide-react';

export default function AppRightSidebar({
   ...props
}: React.ComponentProps<typeof Sidebar>) {
   const { collapsible: __, side: _, ...restProps } = props;
   const setRightSidebarOpen = useSettingsStore((s) => s.setRightSidebarOpen);

   return (
      <Sidebar side="right" collapsible="none" {...restProps}>
         <SidebarHeader>
            <Button
               variant="ghost"
               size="icon-xs"
               className="h-7 w-7 ml-auto rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground cursor-pointer"
               title="Close panel"
               onClick={() => setRightSidebarOpen(false)}
            >
               <XIcon className="h-4 w-4" />
            </Button>
         </SidebarHeader>

         <SidebarContent>
            <ChatBot />
         </SidebarContent>
      </Sidebar>
   );
}
