import type { UIMessage } from 'ai';

import { Fragment, useMemo } from 'react';

import { useChatMessageTreeStore } from '@/store/chat-message-tree-store';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  Message,
  MessageAction,
  MessageActions,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageToolbar,
} from '@/components/ai-elements/message';

import { PencilIcon, RefreshCcwIcon } from 'lucide-react';

import { MessageCopyAction } from '@/features/companion/components/message-copy-action';
import { MessageMoreMenu } from '@/features/companion/components/message-more-menu';
import { getCopyableMessageText } from '@/features/companion/lib/message-text';
import { MessageBody } from '@/features/companion/components/message-body';
import { getVersionInfo } from '@/features/companion/lib/message-tree';

export interface MessageViewProps {
  onEditSave: (userMessageId: string, newText: string) => void;
  onSwitchVersion: (targetMessageId: string) => void;
  onBranch: (assistantMessageId: string) => void;
  onRetry: (assistantMessageId: string) => void;
  onEditStart: (userMessageId: string) => void;
  onCreateNote: (message: UIMessage) => void;
  conversationId?: undefined | string;
  editingMessageId: string | null;
  onEditCancel: () => void;
  isGenerating: boolean;
  isStreaming: boolean;
  message: UIMessage;
}

export function MessageView({
  editingMessageId,
  onSwitchVersion,
  conversationId,
  isGenerating,
  onEditCancel,
  onCreateNote,
  isStreaming,
  onEditStart,
  onEditSave,
  onBranch,
  message,
  onRetry,
}: MessageViewProps) {
  const copyableText = useMemo(() => getCopyableMessageText(message), [message]);

  const isAssistant = message.role === 'assistant';
  const isUser = message.role === 'user';
  const isEditing = editingMessageId === message.id;
  const actionsDisabled = isGenerating || isStreaming;
  const tree = useChatMessageTreeStore((state) => state.trees[conversationId ?? '']);
  const versionInfo = useMemo(
    // oxlint-disable-next-line typescript/no-unnecessary-condition -- tree is undefined before the store loads
    () => (tree ? getVersionInfo(tree, message.id) : null),
    [message.id, tree],
  );

  if (versionInfo && tree) {
    return (
      <Message from={message.role}>
        <MessageBranch
          defaultBranch={versionInfo.current}
          onBranchChange={(branchIndex) => {
            const target = versionInfo.siblings[branchIndex];
            if (target && target !== message.id) {
              onSwitchVersion(target);
            }
          }}
        >
          <MessageBranchContent>
            {versionInfo.siblings.map((siblingId) => {
              const siblingMessage =
                siblingId === message.id ? message : (tree.nodes[siblingId]?.message ?? message);

              return (
                <Fragment key={siblingId}>
                  <MessageBody
                    isEditing={editingMessageId === siblingMessage.id}
                    isStreaming={isStreaming && siblingId === message.id}
                    message={siblingMessage}
                    onEditCancel={onEditCancel}
                    onEditSave={(newText) => onEditSave(siblingMessage.id, newText)}
                  />
                </Fragment>
              );
            })}
          </MessageBranchContent>
          {!isStreaming && !isEditing && (
            <MessageToolbar
              className={cn({
                'justify-start': isAssistant,
                'justify-end': isUser,
              })}
            >
              <MessageBranchSelector>
                <MessageBranchPrevious />
                <MessageBranchPage />
                <MessageBranchNext />
              </MessageBranchSelector>
              <MessageActions>
                {isAssistant && (
                  <MessageAction
                    disabled={actionsDisabled}
                    label={m.chat_message_retry()}
                    onClick={() => onRetry(message.id)}
                    tooltip={m.chat_message_retry()}
                  >
                    <RefreshCcwIcon />
                  </MessageAction>
                )}
                {isUser && (
                  <MessageAction
                    disabled={actionsDisabled}
                    label={m.chat_message_edit()}
                    onClick={() => onEditStart(message.id)}
                    tooltip={m.chat_message_edit()}
                  >
                    <PencilIcon />
                  </MessageAction>
                )}
                {copyableText && <MessageCopyAction text={copyableText} />}
                {isAssistant && (
                  <MessageMoreMenu
                    disabled={actionsDisabled}
                    onBranch={() => onBranch(message.id)}
                    onCreateNote={() => onCreateNote(message)}
                  />
                )}
              </MessageActions>
            </MessageToolbar>
          )}
        </MessageBranch>
      </Message>
    );
  }

  return (
    <Message from={message.role}>
      <MessageBody
        isEditing={isEditing && isUser}
        isStreaming={isStreaming}
        message={message}
        onEditCancel={onEditCancel}
        onEditSave={(newText) => onEditSave(message.id, newText)}
      />

      {!isEditing && !isStreaming && (
        <MessageActions>
          {isAssistant && (
            <MessageAction
              disabled={actionsDisabled}
              label={m.chat_message_retry()}
              onClick={() => onRetry(message.id)}
              tooltip={m.chat_message_retry()}
            >
              <RefreshCcwIcon />
            </MessageAction>
          )}
          {isUser && (
            <MessageAction
              disabled={actionsDisabled}
              label={m.chat_message_edit()}
              onClick={() => onEditStart(message.id)}
              tooltip={m.chat_message_edit()}
            >
              <PencilIcon />
            </MessageAction>
          )}
          {copyableText && <MessageCopyAction text={copyableText} />}
          {isAssistant && (
            <MessageMoreMenu
              disabled={actionsDisabled || !conversationId}
              onBranch={() => onBranch(message.id)}
              onCreateNote={() => onCreateNote(message)}
            />
          )}
        </MessageActions>
      )}
    </Message>
  );
}
