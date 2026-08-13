import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { UIMessage } from 'ai';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { useStickToBottomContext } from 'use-stick-to-bottom';
import { toast } from 'sonner';

import { useCompanionChatSession } from '@/features/companion/hooks/use-companion-chat-session';
import { PromptInputAttachmentsDisplay } from '@/features/companion/components/chat-attachment';
import { ModelItem } from '@/features/companion/components/chat-model-item';
import { models, chefs } from '@/features/companion/chat-mock-data';

import { useCompanionContextStore } from '@/store/companion-context-store';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from '@/components/ai-elements/model-selector';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { SpeechInput } from '@/components/ai-elements/speech-input';
import { Shimmer } from '@/components/ai-elements/shimmer';

import { Spinner } from '@/components/ui/spinner';

import {
  CopyIcon,
  FilePlusIcon,
  ReplaceIcon,
  GlobeIcon,
  SparklesIcon,
} from 'lucide-react';

const SHOW_MODEL_SELECTOR = false;

export interface ChatBotHandle {
  prependMessages: (messages: UIMessage[]) => void;
  sendText: (text: string) => void;
}

interface ChatBotProps {
  onConversationId?: (conversationId: string) => void;
  onFinish?: (result: { message: UIMessage }) => void;
  isLoadingOlderMessages?: boolean;
  onLoadOlderMessages?: () => void;
  initialConversationId?: string;
  hasMoreMessages?: boolean;
  messages?: UIMessage[];
  disabled?: boolean;
  centered?: boolean;
  className?: string;
}

const ChatBot = forwardRef<ChatBotHandle, ChatBotProps>(function ChatBot(
  {
    isLoadingOlderMessages = false,
    messages: loadedMessages,
    hasMoreMessages = false,
    initialConversationId,
    onLoadOlderMessages,
    onConversationId,
    disabled = false,
    centered = false,
    className,
    onFinish,
  },
  ref,
) {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const chat = useCompanionChatSession({
    onError: (error) => {
      console.error(error);
      toast.error(m.chat_error_send(), {
        description: m.common_error_connection(),
      });
    },
    initialMessages: loadedMessages,
    initialConversationId,
    onConversationId,
    onFinish,
  });

  useLayoutEffect(() => {
    if (!loadedMessages || loadedMessages.length === 0) return;
    if (chat.messages.length >= loadedMessages.length) return;

    const knownIds = new Set(chat.messages.map((message) => message.id));
    const olderMessages = loadedMessages.filter(
      (message) => !knownIds.has(message.id),
    );
    if (olderMessages.length === 0) return;

    chat.setMessages((prev) => [...olderMessages, ...prev]);
  }, [loadedMessages, chat.messages, chat.setMessages]);

  useImperativeHandle(
    ref,
    () => ({
      prependMessages: (olderMessages) => {
        chat.setMessages((prev) => [...olderMessages, ...prev]);
      },
      sendText: (content) => {
        void chat.sendMessage({ text: content });
        setText('');
      },
    }),
    [chat],
  );

  const status = chat.status;
  const liveMessages = chat.messages;
  const isGenerating = status === 'submitted' || status === 'streaming';

  const lastMessage = liveMessages[liveMessages.length - 1];
  const isAwaitingResponse =
    isGenerating &&
    (lastMessage?.role === 'user' ||
      (lastMessage?.role === 'assistant' && lastMessage.parts.length === 0));

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasAttachments = Boolean(message.files?.length);
      if (hasAttachments) {
        toast.error(m.chat_attachments_not_supported());
        return;
      }

      const content = message.text?.trim();
      if (!content) {
        return;
      }

      void chat.sendMessage({ text: content });
      setText('');
    },
    [chat],
  );

  const handleTranscriptionChange = useCallback((transcript: string) => {
    setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
  }, []);

  const handleTextChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value);
    },
    [],
  );

  const toggleWebSearch = useCallback(() => {
    setUseWebSearch((prev) => !prev);
  }, []);

  const handleModelSelect = useCallback((modelId: string) => {
    setModel(modelId);
    setModelSelectorOpen(false);
  }, []);

  const selectedModelData = models.find((item) => item.id === model);

  const isSubmitDisabled = (!text.trim() && !isGenerating) || disabled;

  return (
    <div
      className={cn(
        'relative flex size-full flex-col divide-y overflow-hidden',
        className,
      )}
    >
      {liveMessages.length > 0 ? (
        <Conversation>
          {hasMoreMessages && (
            <ConversationLoadOlder
              isLoading={isLoadingOlderMessages}
              onLoadOlder={onLoadOlderMessages}
            />
          )}
          <ConversationContent
            className={cn(centered && 'mx-auto w-full max-w-6xl')}
          >
            {liveMessages.map((message, index) => (
              <MessageView
                isStreaming={isGenerating && index === liveMessages.length - 1}
                key={message.id}
                message={message}
              />
            ))}
            {isAwaitingResponse && (
              <Message from="assistant">
                <MessageContent>
                  <Shimmer duration={1}>{m.chat_thinking()}</Shimmer>
                </MessageContent>
              </Message>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      ) : (
        <ConversationEmptyState
          description={m.chat_agent_desc()}
          icon={<SparklesIcon className="size-5" />}
          title="Synapse AI"
        />
      )}

      <div className="shrink-0 px-4 py-5">
        <div className={cn('w-full', centered && 'mx-auto max-w-6xl')}>
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea
                disabled={disabled}
                onChange={handleTextChange}
                value={text}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger disabled={disabled} />
                  <PromptInputActionMenuContent className={'max-w-56 w-full'}>
                    <PromptInputActionAddAttachments className={'w-full'} />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                  {...(disabled ? { disabled: true } : {})}
                />
                <PromptInputButton
                  disabled={disabled}
                  onClick={toggleWebSearch}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>{m.chat_search_toggle()}</span>
                </PromptInputButton>
                {SHOW_MODEL_SELECTOR && (
                  <ModelSelector
                    onOpenChange={setModelSelectorOpen}
                    open={modelSelectorOpen}
                  >
                    <ModelSelectorTrigger
                      render={
                        <PromptInputButton>
                          {selectedModelData?.chefSlug && (
                            <ModelSelectorLogo
                              provider={selectedModelData.chefSlug}
                            />
                          )}
                          {selectedModelData?.name && (
                            <ModelSelectorName>
                              {selectedModelData.name}
                            </ModelSelectorName>
                          )}
                        </PromptInputButton>
                      }
                    />

                    <ModelSelectorContent showCloseButton={false}>
                      <ModelSelectorInput
                        placeholder={m.chat_search_models_placeholder()}
                      />

                      <ModelSelectorList>
                        <ModelSelectorEmpty>
                          {m.chat_search_models_empty()}
                        </ModelSelectorEmpty>
                        {chefs.map((chef) => (
                          <ModelSelectorGroup heading={chef} key={chef}>
                            {models
                              .filter((item) => item.chef === chef)
                              .map((item) => (
                                <ModelItem
                                  isSelected={model === item.id}
                                  key={item.id}
                                  m={item}
                                  onSelect={handleModelSelect}
                                />
                              ))}
                          </ModelSelectorGroup>
                        ))}
                      </ModelSelectorList>
                    </ModelSelectorContent>
                  </ModelSelector>
                )}
              </PromptInputTools>

              <PromptInputSubmit
                disabled={isSubmitDisabled}
                onStop={chat.stop}
                status={status}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
});

export default ChatBot;

function ConversationLoadOlder({
  onLoadOlder,
  isLoading,
}: {
  onLoadOlder?: () => void;
  isLoading: boolean;
}) {
  const { scrollRef } = useStickToBottomContext();
  const [atTop, setAtTop] = useState(false);
  const prevHeightRef = useRef(0);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const handleScroll = () => {
      setAtTop(element.scrollTop <= 1);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [scrollRef]);

  useEffect(() => {
    if (atTop && !isLoading && onLoadOlder) {
      const element = scrollRef.current;
      prevHeightRef.current = element?.scrollHeight ?? 0;
      onLoadOlder();
    }
  }, [atTop, isLoading, onLoadOlder, scrollRef]);

  useEffect(() => {
    if (wasLoadingRef.current && !isLoading) {
      const element = scrollRef.current;
      if (element && prevHeightRef.current > 0) {
        element.scrollTop += element.scrollHeight - prevHeightRef.current;
      }
    }
    wasLoadingRef.current = isLoading;
  }, [isLoading, scrollRef]);

  if (!isLoading) return null;

  return (
    <div
      className="absolute top-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-background/80 p-2 shadow-sm backdrop-blur-sm"
      role="status"
    >
      <Spinner className="size-4" />
    </div>
  );
}

type ChatPart = UIMessage['parts'][number];

type SourcePart = Extract<ChatPart, { type: 'source-url' | 'source-document' }>;

interface MessageViewProps {
  isStreaming: boolean;
  message: UIMessage;
}

function MessageView({ isStreaming, message }: MessageViewProps) {
  const sourceParts = message.parts.filter(
    (part): part is SourcePart =>
      part.type === 'source-url' || part.type === 'source-document',
  );
  const reasoningParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'reasoning' }> =>
      part.type === 'reasoning',
  );
  const textParts = message.parts.filter(
    (part): part is Extract<ChatPart, { type: 'text' }> => part.type === 'text',
  );

  return (
    <Message from={message.role}>
      {sourceParts.length > 0 && (
        <Sources>
          <SourcesTrigger count={sourceParts.length} />
          <SourcesContent>
            {sourceParts.map((part, index) => (
              <Source
                href={part.type === 'source-url' ? part.url : undefined}
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
          key={index}
          isStreaming={part.state === 'streaming'}
        >
          <ReasoningTrigger />
          <ReasoningContent>{part.text}</ReasoningContent>
        </Reasoning>
      ))}
      {textParts.map((part, index) => (
        <MessageContent key={index}>
          <MessageResponse isAnimating={isStreaming}>
            {part.text}
          </MessageResponse>
        </MessageContent>
      ))}

      {message.role === 'assistant' && textParts.length > 0 && (
        <MessageActions>
          <MessageAssistantActions
            text={textParts.map((part) => part.text).join('\n\n')}
          />
        </MessageActions>
      )}
    </Message>
  );
}

function MessageAssistantActions({ text }: { text: string }) {
  const editorBridge = useCompanionContextStore((state) => state.editorBridge);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(text);
    toast.success(m.companion_message_copied());
  }, [text]);

  if (!editorBridge) return null;

  return (
    <>
      <MessageAction
        tooltip={m.companion_message_insert()}
        label={m.companion_message_insert()}
        onClick={() => editorBridge.insert(text)}
      >
        <FilePlusIcon />
      </MessageAction>
      <MessageAction
        tooltip={m.companion_message_replace()}
        label={m.companion_message_replace()}
        onClick={() => editorBridge.replace(text)}
      >
        <ReplaceIcon />
      </MessageAction>
      <MessageAction
        tooltip={m.companion_message_copy()}
        label={m.companion_message_copy()}
        onClick={handleCopy}
      >
        <CopyIcon />
      </MessageAction>
    </>
  );
}
