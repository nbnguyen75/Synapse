import { useCallback, useEffect } from 'react';

import { toast } from 'sonner';

import {
  MAX_CHAT_ATTACHMENTS,
  useChatNoteAttachmentStore,
} from '@/store/chat-note-attachment-store';

import { m } from '@/paraglide/messages';

import {
  Attachment,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
  type AttachmentData,
} from '@/components/ai-elements/attachments';
import { usePromptInputAttachments } from '@/components/ai-elements/prompt-input';

export const AttachmentItem = ({
  attachment,
  onRemove,
}: {
  onRemove: (id: string) => void;
  attachment: AttachmentData;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(attachment.id);
  }, [onRemove, attachment.id]);

  return (
    <Attachment className="max-w-44" data={attachment} onRemove={handleRemove}>
      <AttachmentPreview />
      <AttachmentInfo />
      <AttachmentRemove />
    </Attachment>
  );
};

export const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();
  const pending = useChatNoteAttachmentStore((state) => state.attachments);
  const clear = useChatNoteAttachmentStore((state) => state.clear);

  useEffect(() => {
    if (pending.length === 0) return;

    const capacity = Math.max(0, MAX_CHAT_ATTACHMENTS - attachments.files.length);
    if (capacity <= 0) {
      toast.error(m.chat_attachments_max());
    } else {
      attachments.add(pending.slice(0, capacity).map((note) => note.file));
    }
    clear();
  }, [attachments, clear, pending]);

  const handleRemove = useCallback(
    (id: string) => {
      attachments.remove(id);
    },
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem attachment={attachment} key={attachment.id} onRemove={handleRemove} />
      ))}
    </Attachments>
  );
};
