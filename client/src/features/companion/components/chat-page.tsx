import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useGetConversationMessagesQuery } from '@/features/companion/hooks/use-companion-conversation';
import ChatBot from '@/features/companion/components/chat-bot';

import { useCompanionStore } from '@/store/companion-store';

import { Spinner } from '@/components/ui/spinner';

export default function ChatPage() {
  const queryClient = useQueryClient();
  const activeConversationId = useCompanionStore(
    (state) => state.activeConversationId,
  );
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  const { data: messages = [], isLoading } =
    useGetConversationMessagesQuery(activeConversationId);

  const handleConversationId = useCallback(
    (conversationId: string) => {
      setActiveConversationId(conversationId);
      void queryClient.invalidateQueries({
        queryKey: ['companion-conversations'],
      });
    },
    [queryClient, setActiveConversationId],
  );

  const isLoadingConversation = activeConversationId !== null && isLoading;

  return (
    <div className="relative size-full overflow-hidden">
      {isLoadingConversation && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
          role="status"
        >
          <Spinner className="size-6" />
        </div>
      )}

      <ChatBot
        className="size-full"
        disabled={isLoadingConversation}
        initialConversationId={activeConversationId ?? undefined}
        initialMessages={activeConversationId ? messages : undefined}
        key={activeConversationId ?? 'new-chat'}
        onConversationId={handleConversationId}
      />
    </div>
  );
}
