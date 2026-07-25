import { useCallback } from 'react';

import {
   Attachment,
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
      <Attachment data={attachment} onRemove={handleRemove}>
         <AttachmentPreview />
         <AttachmentRemove />
      </Attachment>
   );
};

export const PromptInputAttachmentsDisplay = () => {
   const attachments = usePromptInputAttachments();

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
            <AttachmentItem
               attachment={attachment}
               key={attachment.id}
               onRemove={handleRemove}
            />
         ))}
      </Attachments>
   );
};
