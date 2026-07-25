import ChatBot from '@/features/chat/components/chat-bot';

import {
   Item,
   ItemMedia,
   ItemContent,
   ItemTitle,
   ItemDescription,
} from '@/components/ui/item';

import { SparklesIcon } from 'lucide-react';

export default function ChatPage() {
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
