import { createFileRoute } from '@tanstack/react-router';

import { createTitle } from '@/shared/lib/metadata';

import {
   Item,
   ItemMedia,
   ItemContent,
   ItemTitle,
   ItemDescription,
} from '@/shared/components/ui/item';

import { SparklesIcon } from 'lucide-react';

import { ChatBot } from '@/core/layouts/right-sidebar-tabs-content';
import { m } from '@/paraglide/messages';

export const Route = createFileRoute('/_app/chat')({
   head: () => ({
      meta: [{ title: createTitle(m.chat_page_title()) }],
   }),
   component: RouteComponent,
});

function RouteComponent() {
   return (
      <div className="flex h-full flex-col">
         <Item>
            <ItemMedia variant="icon">
               <SparklesIcon />
            </ItemMedia>
            <ItemContent>
               <ItemTitle>Sebastian</ItemTitle>
               <ItemDescription>I am your servant</ItemDescription>
            </ItemContent>
         </Item>
         <ChatBot />
      </div>
   );
}
