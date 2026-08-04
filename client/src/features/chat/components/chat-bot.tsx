import type { PromptInputMessage } from '@/components/ai-elements/prompt-input';
import type { UIMessage } from 'ai';

import { useCallback, useState } from 'react';

import { toast } from 'sonner';

import { PromptInputAttachmentsDisplay } from '@/features/chat/components/chat-attachment';
import { models, suggestions, chefs } from '@/features/chat/lib/chat-mock-data';
import { useChatSession } from '@/features/chat/hooks/use-chat-session';
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
  Conversation,
  ConversationContent,
  ConversationEmptyState,
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
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import { SpeechInput } from '@/components/ai-elements/speech-input';
import { Suggestion } from '@/components/ai-elements/suggestion';
import { Shimmer } from '@/components/ai-elements/shimmer';

import { GlobeIcon, SparklesIcon } from 'lucide-react';

const SHOW_MODEL_SELECTOR = false;

interface ChatBotProps {
  onConversationId?: (conversationId: string) => void;
  initialConversationId?: string;
  initialMessages?: UIMessage[];
  className?: string;
}

export default function ChatBot({
  initialConversationId,
  onConversationId,
  initialMessages,
  className,
}: ChatBotProps) {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [text, setText] = useState<string>('');
  const [useWebSearch, setUseWebSearch] = useState<boolean>(false);

  const chat = useChatSession({
    onError: (error) => {
      toast.error(m.chat_error_send(), { description: error.message });
    },
    initialConversationId,
    onConversationId,
    initialMessages,
  });

  const status = chat.status;
  const messages = chat.messages;
  const isGenerating = status === 'submitted' || status === 'streaming';

  const lastMessage = messages[messages.length - 1];
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

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      void chat.sendMessage({ text: suggestion });
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

  const isSubmitDisabled = !text.trim() && !isGenerating;

  return (
    <div
      className={cn(
        'relative flex size-full flex-col divide-y overflow-hidden',
        className,
      )}
    >
      {messages.length > 0 ? (
        <Conversation>
          <ConversationContent>
            {messages.map((message, index) => (
              <MessageView
                isStreaming={isGenerating && index === messages.length - 1}
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
        // <div className="flex flex-1 flex-col items-center justify-center gap-8 p-8">
        //   <div className="flex flex-col items-center gap-3 text-center">
        //     <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        //       <SparklesIcon className="size-5" />
        //     </div>
        //     <div className="space-y-1">
        //       <h3 className="text-sm font-medium">{m.chat_agent_name()}</h3>
        //       <p className="text-muted-foreground text-sm">
        //         {m.chat_agent_desc()}
        //       </p>
        //     </div>
        //   </div>
        //   <div className="flex max-w-xl flex-wrap items-center justify-center gap-2">
        //     {suggestions.map((suggestion) => (
        //       <Suggestion
        //         className="text-foreground/70 hover:text-foreground"
        //         key={suggestion}
        //         onClick={handleSuggestionClick}
        //         suggestion={suggestion}
        //       />
        //     ))}
        //   </div>
        // </div>
      )}

      <div className="shrink-0 px-4 py-5">
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
    </Message>
  );
}
