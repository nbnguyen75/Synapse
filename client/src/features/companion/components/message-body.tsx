import type { UIMessage } from 'ai';

import {
  Attachment,
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
  AttachmentInfo,
  AttachmentPreview,
  Attachments,
  getAttachmentLabel,
  getMediaCategory,
} from '@/components/ai-elements/attachments';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning';
import { Source, Sources, SourcesContent, SourcesTrigger } from '@/components/ai-elements/sources';
import { MessageContent, MessageResponse } from '@/components/ai-elements/message';

import { MessageEditForm } from '@/features/companion/components/message-edit-form';

type ChatPart = UIMessage['parts'][number];

type SourcePart = Extract<ChatPart, { type: 'source-document' | 'source-url' }>;

export function MessageBody({
  onEditCancel,
  isStreaming,
  onEditSave,
  isEditing,
  message,
}: {
  onEditSave?: (newText: string) => void;
  onEditCancel?: () => void;
  isStreaming: boolean;
  isEditing?: boolean;
  message: UIMessage;
}) {
  const sourceParts = message.parts.filter(
    (part): part is SourcePart => part.type === 'source-url' || part.type === 'source-document',
  );
  const reasoningParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'reasoning' }> => part.type === 'reasoning',
  );
  const textParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'text' }> => part.type === 'text',
  );
  const fileParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'file' }> => part.type === 'file',
  );

  return (
    <>
      {sourceParts.length > 0 && (
        <Sources>
          <SourcesTrigger count={sourceParts.length} />
          <SourcesContent>
            {sourceParts.map((part, index) => (
              <Source
                href={part.type === 'source-url' ? part.url : undefined}
                // Source parts carry no stable id; they are positional and
                // static once delivered, so the list index is a safe key.
                // oxlint-disable-next-line @eslint-react/no-array-index-key
                key={index}
                title={part.title}
              />
            ))}
          </SourcesContent>
        </Sources>
      )}
      {reasoningParts.map((part, index) => (
        <Reasoning
          defaultOpen={false}
          // Reasoning parts have no id; positional ordering is stable for a
          // given message, so the list index is a safe key.
          // oxlint-disable-next-line @eslint-react/no-array-index-key
          key={index}
          isStreaming={part.state === 'streaming'}
        >
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      ))}
      {fileParts.length > 0 && (
        <MessageContent className="group-[.is-user]:bg-transparent">
          <Attachments variant="inline">
            {fileParts.map((part) => {
              const attachmentData = {
                filename: part.filename ?? 'Untitled',
                mediaType: part.mediaType,
                type: 'file' as const,
                url: part.url,
                id: part.url,
              };

              const mediaCategory = getMediaCategory(attachmentData);
              const label = getAttachmentLabel(attachmentData);

              return (
                <AttachmentHoverCard key={part.url}>
                  <AttachmentHoverCardTrigger
                    render={
                      <Attachment data={attachmentData}>
                        <div className="relative size-5 shrink-0">
                          <AttachmentPreview />
                        </div>
                        <AttachmentInfo />
                      </Attachment>
                    }
                  />

                  <AttachmentHoverCardContent className="rounded-md">
                    <div className="space-y-3">
                      {mediaCategory === 'image' && part.url && (
                        <div className="flex max-h-96 w-80 items-center justify-center overflow-hidden rounded-md border">
                          <img
                            alt={label}
                            className="max-h-full max-w-full object-contain"
                            src={part.url}
                          />
                        </div>
                      )}
                      <div className="space-y-1 px-0.5">
                        <h4 className="font-semibold text-sm leading-none">{label}</h4>
                        {part.mediaType && (
                          <p className="font-mono text-muted-foreground text-xs">
                            {part.mediaType}
                          </p>
                        )}
                      </div>
                    </div>
                  </AttachmentHoverCardContent>
                </AttachmentHoverCard>
              );
            })}
          </Attachments>
        </MessageContent>
      )}
      {isEditing && onEditSave && onEditCancel ? (
        <MessageEditForm
          initialText={textParts.map((part) => part.text).join('\n\n')}
          key={message.id}
          onCancel={onEditCancel}
          onSave={onEditSave}
        />
      ) : (
        textParts.map((part, index) => (
          // Text parts have no id and may change content while streaming;
          // a content-derived key would remount and interrupt animations.
          // oxlint-disable-next-line @eslint-react/no-array-index-key
          <MessageContent key={index}>
            <MessageResponse isAnimating={isStreaming}>{part.text}</MessageResponse>
          </MessageContent>
        ))
      )}
    </>
  );
}
