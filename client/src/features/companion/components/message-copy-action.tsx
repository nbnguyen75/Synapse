import { useCallback } from 'react';

import { toast } from 'sonner';

import { m } from '@/paraglide/messages';

import { MessageAction } from '@/components/ai-elements/message';

import { CopyIcon } from 'lucide-react';

export function MessageCopyAction({ text }: { text: string }) {
  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    toast.success(m.chat_message_copied());
  }, [text]);

  return (
    <MessageAction
      tooltip={m.chat_message_copy()}
      label={m.chat_message_copy()}
      onClick={() => void handleCopy()}
    >
      <CopyIcon />
    </MessageAction>
  );
}
