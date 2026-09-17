import type { ChatStatus } from 'ai';

import {
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputSubmit,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';

export interface AttachmentActionsMenuProps {
  disabled?: boolean;
}

export function AttachmentActionsMenu({ disabled = false }: AttachmentActionsMenuProps) {
  return (
    <PromptInputActionMenu>
      <PromptInputActionMenuTrigger disabled={disabled} />
      <PromptInputActionMenuContent className="w-full max-w-56">
        <PromptInputActionAddAttachments className="w-full" />
      </PromptInputActionMenuContent>
    </PromptInputActionMenu>
  );
}

export interface PromptToolActionsProps {
  disabled?: boolean;
}

export function PromptToolActions({ disabled = false }: PromptToolActionsProps) {
  return (
    <PromptInputTools>
      <AttachmentActionsMenu disabled={disabled} />
    </PromptInputTools>
  );
}

export interface RightActionClusterProps {
  isSubmitDisabled: boolean;
  onStop: () => void;
  status: ChatStatus;
}

export function RightActionCluster({ isSubmitDisabled, onStop, status }: RightActionClusterProps) {
  return (
    <div className="ms-auto flex items-center gap-1.5">
      <PromptInputSubmit
        className="size-8 shrink-0 transition-transform active:scale-95"
        disabled={isSubmitDisabled}
        onStop={onStop}
        status={status}
      />
    </div>
  );
}
