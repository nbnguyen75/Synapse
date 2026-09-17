import { useCallback, useState } from 'react';

import { m } from '@/paraglide/messages';

import { MessageAction, MessageActions, MessageContent } from '@/components/ai-elements/message';

import { Textarea } from '@/components/ui/textarea';

import { CheckIcon, XIcon } from 'lucide-react';

export function MessageEditForm({
  initialText,
  onCancel,
  onSave,
}: {
  onSave: (newText: string) => void;
  onCancel: () => void;
  initialText: string;
}) {
  const [draft, setDraft] = useState(initialText);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const trimmed = draft.trim();
        if (trimmed) onSave(trimmed);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancel();
      }
    },
    [draft, onCancel, onSave],
  );

  return (
    <MessageContent className="w-full">
      <Textarea
        autoFocus
        className="min-h-24 w-full"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        value={draft}
      />
      <MessageActions>
        <MessageAction
          label={m.chat_message_edit_save()}
          onClick={() => {
            const trimmed = draft.trim();
            if (trimmed) onSave(trimmed);
          }}
          tooltip={m.chat_message_edit_save()}
        >
          <CheckIcon />
        </MessageAction>
        <MessageAction
          label={m.chat_message_edit_cancel()}
          onClick={onCancel}
          tooltip={m.chat_message_edit_cancel()}
        >
          <XIcon />
        </MessageAction>
      </MessageActions>
    </MessageContent>
  );
}
