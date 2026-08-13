import { useEffect } from 'react';

import { createFileRoute, redirect, useParams } from '@tanstack/react-router';

import { useChatModeGuard } from '@/features/companion/hooks/use-chat-mode-guard';
import ChatPage from '@/features/companion/components/chat-page';

import { readPersistedLayoutMode } from '@/store/settings-store';
import { useCompanionStore } from '@/store/companion-store';

export const Route = createFileRoute('/_app/chat/$conversationId')({
  beforeLoad: () => {
    if (readPersistedLayoutMode() !== 'chat') {
      throw redirect({ to: '/notes' });
    }
  },
  component: ChatConversationPage,
});

function ChatConversationPage() {
  const { conversationId } = useParams({ from: '/_app/chat/$conversationId' });
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  useChatModeGuard();

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId, setActiveConversationId]);

  return <ChatPage />;
}
