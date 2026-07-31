import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { MessageType } from '@/features/chat/lib/chat-mock-data';

import { useCallback, useMemo, useState } from 'react';

import { toast } from 'sonner';

import {
  initialMessages,
  models,
  suggestions,
  mockResponses,
  delay,
  chefs,
} from '@/features/chat/lib/chat-mock-data';
import { PromptInputAttachmentsDisplay } from '@/features/chat/components/chat-attachment';
import { SuggestionItem } from '@/features/chat/components/chat-suggestion';
import { ModelItem } from '@/features/chat/components/chat-model-item';

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
  Message,
  MessageBranch,
  MessageBranchContent,
  MessageBranchNext,
  MessageBranchPage,
  MessageBranchPrevious,
  MessageBranchSelector,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
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
import { Suggestions } from '@/components/ai-elements/suggestion';

import { GlobeIcon } from 'lucide-react';

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className }: ChatBotProps) {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);
  const [status, setStatus] = useState<
    'submitted' | 'streaming' | 'ready' | 'error'
  >('ready');
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);
  const [, setStreamingMessageId] = useState<string | null>(null);

  const selectedModelData = useMemo(
    () => models.find((m) => m.id === model),
    [model],
  );

  const updateMessageContent = useCallback(
    (messageId: string, newContent: string) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.versions.some((v) => v.id === messageId)) {
            return {
              ...msg,
              versions: msg.versions.map((v) =>
                v.id === messageId ? { ...v, content: newContent } : v,
              ),
            };
          }
          return msg;
        }),
      );
    },
    [],
  );

  const streamResponse = useCallback(
    async (messageId: string, content: string) => {
      setStatus('streaming');
      setStreamingMessageId(messageId);

      const words = content.split(' ');
      let currentContent = '';

      for (const [i, word] of words.entries()) {
        currentContent += (i > 0 ? ' ' : '') + word;
        updateMessageContent(messageId, currentContent);
        await delay(Math.random() * 100 + 50);
      }

      setStatus('ready');
      setStreamingMessageId(null);
    },
    [updateMessageContent],
  );

  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: MessageType = {
        versions: [
          {
            id: `user-${Date.now()}`,
            content,
          },
        ],
        key: `user-${Date.now()}`,
        from: 'user',
      };

      setMessages((prev) => [...prev, userMessage]);

      setTimeout(() => {
        const assistantMessageId = `assistant-${Date.now()}`;
        const randomResponse =
          mockResponses[Math.floor(Math.random() * mockResponses.length)];

        const assistantMessage: MessageType = {
          versions: [
            {
              id: assistantMessageId,
              content: '',
            },
          ],
          key: `assistant-${Date.now()}`,
          from: 'assistant',
        };

        setMessages((prev) => [...prev, assistantMessage]);
        streamResponse(assistantMessageId, randomResponse);
      }, 500);
    },
    [streamResponse],
  );

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      const hasText = Boolean(message.text);
      const hasAttachments = Boolean(message.files?.length);

      if (!(hasText || hasAttachments)) {
        return;
      }

      setStatus('submitted');

      if (message.files?.length) {
        toast.success(m.chat_files_attached(), {
          description: m.chat_files_attached_desc({
            count: message.files.length,
          }),
        });
      }

      addUserMessage(message.text || m.chat_sent_with_attachments());
      setText('');
    },
    [addUserMessage],
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      setStatus('submitted');
      addUserMessage(suggestion);
    },
    [addUserMessage],
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

  const isSubmitDisabled = useMemo(
    () => !(text.trim() || status) || status === 'streaming',
    [text, status],
  );

  return (
    <div
      className={cn(
        'relative flex size-full flex-col divide-y overflow-hidden',
        className,
      )}
    >
      <Conversation>
        <ConversationContent>
          {messages.map(({ versions, ...message }) => (
            <MessageBranch defaultBranch={0} key={message.key}>
              <MessageBranchContent>
                {versions.map((version) => (
                  <Message
                    from={message.from}
                    key={`${message.key}-${version.id}`}
                  >
                    <div>
                      {message.sources?.length && (
                        <Sources>
                          <SourcesTrigger count={message.sources.length} />
                          <SourcesContent>
                            {message.sources.map((source) => (
                              <Source
                                href={source.href}
                                key={source.href}
                                title={source.title}
                              />
                            ))}
                          </SourcesContent>
                        </Sources>
                      )}
                      {message.reasoning && (
                        <Reasoning duration={message.reasoning.duration}>
                          <ReasoningTrigger />
                          <ReasoningContent>
                            {message.reasoning.content}
                          </ReasoningContent>
                        </Reasoning>
                      )}
                      <MessageContent>
                        <MessageResponse>{version.content}</MessageResponse>
                      </MessageContent>
                    </div>
                  </Message>
                ))}
              </MessageBranchContent>
              {versions.length > 1 && (
                <MessageBranchSelector>
                  <MessageBranchPrevious />
                  <MessageBranchPage />
                  <MessageBranchNext />
                </MessageBranchSelector>
              )}
            </MessageBranch>
          ))}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <div className="grid shrink-0 gap-4 pt-4">
        <Suggestions className="px-4">
          {suggestions.map((suggestion) => (
            <SuggestionItem
              key={suggestion}
              onClick={handleSuggestionClick}
              suggestion={suggestion}
            />
          ))}
        </Suggestions>
        <div className="w-full px-4 pb-5">
          <PromptInput globalDrop multiple onSubmit={handleSubmit}>
            <PromptInputHeader>
              <PromptInputAttachmentsDisplay />
            </PromptInputHeader>
            <PromptInputBody>
              <PromptInputTextarea onChange={handleTextChange} value={text} />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent className={'max-w-56 w-full'}>
                    <PromptInputActionAddAttachments className={'w-full'} />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <SpeechInput
                  className="shrink-0"
                  onTranscriptionChange={handleTranscriptionChange}
                  size="icon-sm"
                  variant="ghost"
                />
                <PromptInputButton
                  onClick={toggleWebSearch}
                  variant={useWebSearch ? 'default' : 'ghost'}
                >
                  <GlobeIcon size={16} />
                  <span>{m.chat_search_toggle()}</span>
                </PromptInputButton>
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
                            .filter((m) => m.chef === chef)
                            .map((m) => (
                              <ModelItem
                                isSelected={model === m.id}
                                key={m.id}
                                m={m}
                                onSelect={handleModelSelect}
                              />
                            ))}
                        </ModelSelectorGroup>
                      ))}
                    </ModelSelectorList>
                  </ModelSelectorContent>
                </ModelSelector>
              </PromptInputTools>

              <PromptInputSubmit disabled={isSubmitDisabled} status={status} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
