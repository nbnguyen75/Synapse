import { useEffect } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import ChatPage from '@/features/companion/components/chat-page';
import { useChatModeGuard } from '@/features/companion/hooks/use-chat-mode-guard';

import { useCompanionStore } from '@/store/companion-store';

export const Route = createFileRoute('/_app/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  useChatModeGuard();

  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  useEffect(() => {
    setActiveConversationId(null);
  }, [setActiveConversationId]);

  return <ChatPage />;
}
