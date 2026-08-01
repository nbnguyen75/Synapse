import type { UIMessage } from 'ai';

import { useCallback, useState } from 'react';

import { toast } from 'sonner';

import {
  getConversationMessages,
  type AiConversation,
} from '@/features/chat/lib/chat-api';
import { useConversations } from '@/features/chat/hooks/use-conversations';
import ChatBot from '@/features/chat/components/chat-bot';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

import { MessageSquareTextIcon, SquarePenIcon } from 'lucide-react';

export default function ChatPage() {
  const { conversations, isLoading, refresh } = useConversations();
  const [sessionKey, setSessionKey] = useState(0);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [activeMessages, setActiveMessages] = useState<UIMessage[] | undefined>(
    undefined,
  );

  const handleSelectConversation = useCallback(
    async (conversation: AiConversation) => {
      if (conversation.id === activeConversationId) {
        return;
      }

      try {
        const messages = await getConversationMessages(conversation.id);
        setActiveConversationId(conversation.id);
        setActiveMessages(messages);
        setSessionKey((key) => key + 1);
      } catch (error) {
        toast.error(m.chat_conversation_load_failed(), {
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
    [activeConversationId],
  );

  const handleNewChat = useCallback(() => {
    setActiveConversationId(null);
    setActiveMessages(undefined);
    setSessionKey((key) => key + 1);
  }, []);

  const handleConversationId = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      void refresh();
    },
    [refresh],
  );

  return (
    <div className="flex size-full overflow-hidden">
      <aside className="flex w-64 shrink-0 flex-col border-r">
        <div className="flex items-center justify-between gap-2 p-3">
          <h2 className="text-sm font-medium">{m.chat_conversations()}</h2>
          <Button
            aria-label={m.chat_new_chat()}
            onClick={handleNewChat}
            size="icon-sm"
            title={m.chat_new_chat()}
            variant="ghost"
          >
            <SquarePenIcon />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-1 p-2">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <Skeleton className="h-9 w-full" key={index} />
              ))
            ) : conversations.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                {m.chat_conversations_empty()}
              </p>
            ) : (
              conversations.map((conversation) => {
                const isActive = conversation.id === activeConversationId;
                return (
                  <Button
                    className={cn(
                      'h-auto justify-start gap-2 py-2',
                      isActive && 'bg-muted',
                    )}
                    key={conversation.id}
                    onClick={() => void handleSelectConversation(conversation)}
                    variant="ghost"
                  >
                    <MessageSquareTextIcon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-left text-sm">
                      {conversation.title ?? m.chat_conversation_untitled()}
                    </span>
                  </Button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </aside>

      <ChatBot
        className="flex-1"
        initialConversationId={activeConversationId ?? undefined}
        initialMessages={activeMessages}
        key={sessionKey}
        onConversationId={handleConversationId}
      />
    </div>
  );
}
