import { useCallback, useEffect, useState } from 'react';

import { listConversations, type AiConversation } from '../lib/chat-api';

export function useConversations() {
  const [conversations, setConversations] = useState<AiConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const items = await listConversations();
      setConversations(items);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    conversations,
    isLoading,
    refresh,
  };
}
