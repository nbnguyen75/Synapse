import { useCallback, useMemo } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useGetConversationMessagesInfiniteQuery } from '@/features/companion/hooks/use-companion-conversation';
import ChatBot, {
  type ChatBotHandle,
} from '@/features/companion/components/chat-bot';

import { useCompanionStore } from '@/store/companion-store';

import { cn } from '@/lib/utils';

import { Spinner } from '@/components/ui/spinner';

interface CompanionChatProps {
  chatRef?: React.Ref<ChatBotHandle>;
  centered?: boolean;
  className?: string;
}

export default function CompanionChat({
  centered = false,
  className,
  chatRef,
}: CompanionChatProps) {
  const queryClient = useQueryClient();
  const activeConversationId = useCompanionStore(
    (state) => state.activeConversationId,
  );

  const { isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, data } =
    useGetConversationMessagesInfiniteQuery(activeConversationId);

  const messages = useMemo(
    () => (data ? [...data.pages].reverse().flat() : []),
    [data],
  );

  const handleConversationId = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: ['companion-conversations'],
    });
  }, [queryClient]);

  const isLoadingConversation = activeConversationId !== null && isLoading;

  return (
    <div className={cn('relative size-full overflow-hidden', className)}>
      {isLoadingConversation && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]"
          role="status"
        >
          <Spinner className="size-6" />
        </div>
      )}

      {!isLoadingConversation && (
        <ChatBot
          ref={chatRef}
          className="size-full"
          centered={centered}
          disabled={isLoadingConversation}
          initialConversationId={activeConversationId ?? undefined}
          messages={activeConversationId ? messages : undefined}
          key={activeConversationId ?? 'new-chat'}
          onConversationId={handleConversationId}
          onLoadOlderMessages={
            activeConversationId ? () => fetchNextPage() : undefined
          }
          hasMoreMessages={hasNextPage}
          isLoadingOlderMessages={isFetchingNextPage}
        />
      )}
    </div>
  );
}
