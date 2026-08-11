import { useEffect } from 'react';

import { createFileRoute, useParams } from '@tanstack/react-router';

import ChatPage from '@/features/companion/components/chat-page';

import { useCompanionStore } from '@/store/companion-store';

export const Route = createFileRoute('/_app/chat/$conversationId')({
  component: ChatConversationPage,
});

function ChatConversationPage() {
  const { conversationId } = useParams({ from: '/_app/chat/$conversationId' });
  const setActiveConversationId = useCompanionStore(
    (state) => state.setActiveConversationId,
  );

  useEffect(() => {
    setActiveConversationId(conversationId);
  }, [conversationId, setActiveConversationId]);

  return <ChatPage />;
}
