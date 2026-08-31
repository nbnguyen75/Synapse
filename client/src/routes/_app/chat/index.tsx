import { useEffect } from 'react';

import { createFileRoute } from '@tanstack/react-router';

import { useCompanionStore } from '@/store/companion-store';

import { useChatModeGuard } from '@/features/companion/hooks/use-chat-mode-guard';
import ChatPage from '@/features/companion/components/chat-page';

export const Route = createFileRoute('/_app/chat/')({
  component: RouteComponent,
});

function RouteComponent() {
  useChatModeGuard();

  const setActiveConversationId = useCompanionStore((state) => state.setActiveConversationId);

  useEffect(() => {
    setActiveConversationId(null);
  }, [setActiveConversationId]);

  return <ChatPage />;
}
