import { useEffect } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { useChatModeGuard } from '@/features/companion/hooks/use-chat-mode-guard';
import ChatPage from '@/features/companion/components/chat-page';

import { useCompanionStore } from '@/store/companion-store';

export const Route = createFileRoute('/_app/chat/$conversationId')({
  component: RouteComponent,
});

function RouteComponent() {
  useChatModeGuard();

  const { conversationId } = Route.useParams();
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId, setActiveConversationId]);

  return <ChatPage />;
}
