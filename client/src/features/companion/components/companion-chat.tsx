import { useCallback, useMemo, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useCompanionStore } from '@/store/companion-store';

import { cn } from '@/lib/utils';

import { Spinner } from '@/components/ui/spinner';

import { useGetConversationMessagesInfiniteQuery } from '@/features/companion/hooks/use-companion-conversation';
import ChatBot, { type ChatBotHandle } from '@/features/companion/components/chat-bot';

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

  const activeConversationId = useCompanionStore((state) => state.activeConversationId);
  const setActiveConversationId = useCompanionStore((state) => state.setActiveConversationId);
  const capturedConversationIdRef = useRef<string | null>(null);

  const { isFetchingNextPage, fetchNextPage, hasNextPage, isLoading, data } =
    useGetConversationMessagesInfiniteQuery(activeConversationId);

  const messages = useMemo(() => (data ? [...data.pages].reverse().flat() : []), [data]);

  const handleConversationId = useCallback(
    (conversationId: string) => {
      capturedConversationIdRef.current = conversationId;
      void queryClient.invalidateQueries({
        queryKey: ['companion-conversations'],
      });
    },
    [queryClient],
  );

  const handleConversationFinish = useCallback(() => {
    const capturedConversationId = capturedConversationIdRef.current;

    if (capturedConversationId && !activeConversationId) {
      setActiveConversationId(capturedConversationId);

      if (window.location.pathname === '/chat') {
        window.history.replaceState(null, '', `/chat/${capturedConversationId}`);
      }
    }
  }, [activeConversationId, setActiveConversationId]);

  const isLoadingConversation = activeConversationId !== null && isLoading;

  return (
    <div className={cn('relative size-full overflow-hidden', className)}>
      {isLoadingConversation && (
        <output className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
          <Spinner className="size-6" />
        </output>
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
          onFinish={handleConversationFinish}
          onLoadOlderMessages={activeConversationId ? () => void fetchNextPage() : undefined}
          hasMoreMessages={hasNextPage}
          isLoadingOlderMessages={isFetchingNextPage}
        />
      )}
    </div>
  );
}
