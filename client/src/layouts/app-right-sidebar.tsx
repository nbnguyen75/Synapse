import PomodoroTimer from '@/features/focus/components/pomodoro-timer';
import DraftEditor from '@/features/notes/components/draft-editor';
import ChatBot from '@/features/chat/components/chat-bot';

import { TOGGLE_RIGHT_SIDEBAR_EVENT_NAME } from '@/config/events';

import {
   SidebarHeader,
   SidebarContent,
   Sidebar,
} from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

import { BotIcon, FileTextIcon, HourglassIcon, XIcon } from 'lucide-react';

const tabsMap = [
   {
      icon: FileTextIcon,
      value: 'draft',
      label: 'Draft',
   },
   {
      icon: HourglassIcon,
      value: 'focus',
      label: 'Focus',
   },
   {
      label: 'Sebastian',
      value: 'chat',
      icon: BotIcon,
   },
];

export default function AppRightSidebar({
   ...props
}: React.ComponentProps<typeof Sidebar>) {
   const { collapsible: __, side: _, ...restProps } = props;

   return (
      <Sidebar side="right" collapsible="none" {...restProps}>
         <SidebarHeader>
            <Button
               variant="ghost"
               size="icon-xs"
               className="h-7 w-7 ml-auto rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground cursor-pointer"
               title="Close panel"
               onClick={() =>
                  window.dispatchEvent(
                     new CustomEvent(TOGGLE_RIGHT_SIDEBAR_EVENT_NAME),
                  )
               }
            >
               <XIcon className="h-4 w-4" />
            </Button>
         </SidebarHeader>

         <SidebarContent>
            <Tabs defaultValue="draft" className="px-3 h-full">
               <TabsList className="w-full overflow-y-auto no-scrollbar min-h-9">
                  {tabsMap.map((tab) => {
                     return (
                        <TabsTrigger
                           key={tab.value}
                           className={
                              'flex-1 min-w-fit whitespace-nowrap px-2.5 flex items-center justify-center gap-1.5 py-1 text-sm font-medium rounded-md transition-all cursor-pointer h-7'
                           }
                           value={tab.value}
                        >
                           <tab.icon className="h-3.5 w-3.5" />
                           {tab.label}
                        </TabsTrigger>
                     );
                  })}
               </TabsList>
               <TabsContent className="h-full" value={tabsMap[0].value}>
                  <DraftEditor />
               </TabsContent>
               <TabsContent className="h-full" value={tabsMap[1].value}>
                  <PomodoroTimer />
               </TabsContent>
               <TabsContent className="h-[90%]" value={tabsMap[2].value}>
                  <ChatBot className="mb-10" />
               </TabsContent>
            </Tabs>
         </SidebarContent>
      </Sidebar>
   );
}
