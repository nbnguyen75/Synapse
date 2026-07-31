import ChatBot from '@/features/chat/components/chat-bot';

import { m } from '@/paraglide/messages';

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
          <ItemTitle>{m.chat_agent_name()}</ItemTitle>
          <ItemDescription>{m.chat_agent_desc()}</ItemDescription>
        </ItemContent>
      </Item>
      <ChatBot />
    </div>
  );
}
