import { useEffect } from 'react';

import { createFileRoute, redirect } from '@tanstack/react-router';

import ChatPage from '@/features/companion/components/chat-page';

import { readPersistedLayoutMode } from '@/store/settings-store';
import { useCompanionStore } from '@/store/companion-store';

export const Route = createFileRoute('/_app/chat')({
  beforeLoad: () => {
    if (readPersistedLayoutMode() !== 'chat') {
      throw redirect({ to: '/notes' });
    }
  },
  component: ChatRoute,
});

function ChatRoute() {
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  useEffect(() => {
    setActiveConversationId(null);
  }, [setActiveConversationId]);

  return <ChatPage />;
}
