import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { ChatStatus } from 'ai';

import { useCallback, useMemo } from 'react';

import { toast } from 'sonner';

import {
  MAX_CHAT_ATTACHMENTS,
  useChatNoteAttachmentStore,
} from '@/store/chat-note-attachment-store';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
  PromptInputTextarea,
  usePromptInputController,
} from '@/components/ai-elements/prompt-input';

import {
  AttachmentActionsMenu,
  PromptToolActions,
  RightActionCluster,
} from './conversation-prompt-parts';
import { PromptInputAttachmentsDisplay } from './chat-attachment';

export interface ConversationPromptInputProps {
  onTextChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (message: PromptInputMessage) => void;
  disabled?: boolean;
  centered?: boolean;
  status: ChatStatus;
  onStop: () => void;
  text: string;
}

function ConversationPromptInputContent({
  disabled = false,
  centered = false,
  onSubmit,
  onTextChange,
  onStop,
  status,
  text,
}: ConversationPromptInputProps) {
  const { attachments } = usePromptInputController();
  const pendingNotes = useChatNoteAttachmentStore((state) => state.attachments);

  // Dynamic expansion trigger: multiline text, long prompt, or attached context/files
  const isExpanded = useMemo(() => {
    return (
      attachments.files.length > 0 ||
      pendingNotes.length > 0 ||
      text.includes('\n') ||
      text.length > 70
    );
  }, [attachments.files.length, pendingNotes.length, text]);

  const isGenerating = status === 'streaming' || status === 'submitted';

  const isSubmitDisabled =
    (!text.trim() &&
      attachments.files.length === 0 &&
      pendingNotes.length === 0 &&
      !isGenerating) ||
    disabled;

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      onSubmit(message);
    },
    [onSubmit],
  );

  return (
    <div className="shrink-0 px-4 py-3">
      <div className="flex flex-col gap-2">
        <div className={cn('w-full min-w-0 max-w-full', centered && 'mx-auto max-w-6xl')}>
          {/* Main Dynamic Morphing Prompt Input */}
          <PromptInput
            className={cn(
              'w-full min-w-0 max-w-full transition-all duration-200 ease-out',
              isExpanded
                ? '[&>[data-slot=input-group]]:!flex-col [&>[data-slot=input-group]]:!items-stretch [&>[data-slot=input-group]]:!rounded-2xl [&>[data-slot=input-group]]:!p-3 [&>[data-slot=input-group]]:!h-auto [&>[data-slot=input-group]]:!gap-2 [&>[data-slot=input-group]]:!w-full [&>[data-slot=input-group]]:!min-w-0 [&>[data-slot=input-group]]:!max-w-full [&>[data-slot=input-group]]:border-border/80'
                : '[&>[data-slot=input-group]]:!flex-row [&>[data-slot=input-group]]:!items-center [&>[data-slot=input-group]]:!px-2 [&>[data-slot=input-group]]:!py-1 [&>[data-slot=input-group]]:!h-auto [&>[data-slot=input-group]]:gap-1.5 [&>[data-slot=input-group]]:!w-full [&>[data-slot=input-group]]:!min-w-0 [&>[data-slot=input-group]]:border-border/70',
            )}
            globalDrop
            maxFiles={MAX_CHAT_ATTACHMENTS}
            multiple
            onError={(error) => {
              if (error.code === 'max_files') {
                toast.error(m.chat_attachments_max());
              }
            }}
            onSubmit={handleSubmit}
          >
            {/* Header for attachments previews (in expanded mode) */}
            {isExpanded && (
              <PromptInputHeader className="flex w-full flex-col gap-1.5 p-0">
                <PromptInputAttachmentsDisplay />
              </PromptInputHeader>
            )}

            {/* Left Action Menu in Compact Pill Mode */}
            {!isExpanded && (
              <div className="flex shrink-0 items-center">
                <AttachmentActionsMenu disabled={disabled} />
              </div>
            )}

            {/* Prompt Body */}
            <PromptInputBody className={cn(isExpanded ? 'w-full' : 'min-w-0 flex-1')}>
              <PromptInputTextarea
                className={cn(
                  '!block !w-full !min-w-0 !max-w-full field-sizing-content whitespace-pre-wrap break-all [overflow-wrap:anywhere] overflow-x-hidden overflow-y-auto bg-transparent placeholder:text-muted-foreground focus:outline-hidden resize-none transition-all',
                  isExpanded
                    ? 'min-h-14 max-h-48 py-1.5 px-1 text-sm leading-relaxed'
                    : 'min-h-0 h-8 max-h-8 py-1 px-2 text-sm leading-normal border-none shadow-none',
                )}
                disabled={disabled}
                onChange={onTextChange}
                placeholder={m.workspace_chat_placeholder({ name: 'Synapse' })}
                value={text}
              />
            </PromptInputBody>

            {/* Footer in Expanded Mode OR Right Actions in Pill Mode */}
            <PromptInputFooter
              className={cn(
                isExpanded
                  ? 'w-full justify-between pt-2 border-t border-border/40 p-0'
                  : 'w-auto p-0 flex items-center gap-1 shrink-0 ms-auto',
              )}
            >
              {/* Tools on the Left (Only in Expanded Mode) */}
              {isExpanded && <PromptToolActions disabled={disabled} />}

              {/* Right-aligned Actions: Submit/Stop Button */}
              <RightActionCluster
                isSubmitDisabled={isSubmitDisabled}
                onStop={onStop}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}

export function ConversationPromptInput(props: ConversationPromptInputProps) {
  return (
    <PromptInputProvider>
      <ConversationPromptInputContent {...props} />
    </PromptInputProvider>
  );
}

export default ConversationPromptInput;
