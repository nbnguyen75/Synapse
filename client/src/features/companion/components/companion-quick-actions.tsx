import type { ChatBotHandle } from '@/features/companion/components/chat-bot';

import { useCallback } from 'react';

import {
  buildQuickActionPrompt,
  type QuickActionId,
} from '@/features/companion/config/companion-prompts';

import { useCompanionContextStore } from '@/store/companion-context-store';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import {
  FileSearchIcon,
  GlobeIcon,
  PenLineIcon,
  SparklesIcon,
} from 'lucide-react';

const QUICK_ACTIONS: {
  icon: React.ReactNode;
  id: QuickActionId;
  label: string;
}[] = [
  {
    icon: <FileSearchIcon className="size-3.5" />,
    label: m.companion_quick_summarize(),
    id: 'summarize',
  },
  {
    icon: <GlobeIcon className="size-3.5" />,
    label: m.companion_quick_translate(),
    id: 'translate',
  },
  {
    icon: <PenLineIcon className="size-3.5" />,
    label: m.companion_quick_polish(),
    id: 'polish',
  },
  {
    icon: <SparklesIcon className="size-3.5" />,
    label: m.companion_quick_ask(),
    id: 'ask',
  },
];

export default function CompanionQuickActions({
  chatRef,
}: {
  chatRef: React.RefObject<ChatBotHandle | null>;
}) {
  const activeDocument = useCompanionContextStore(
    (state) => state.activeDocument,
  );

  const handleAction = useCallback(
    (id: QuickActionId) => {
      if (!activeDocument) return;
      chatRef.current?.sendText(buildQuickActionPrompt(id, activeDocument));
    },
    [activeDocument, chatRef],
  );

  if (!activeDocument) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {QUICK_ACTIONS.map((action) => (
        <Button
          key={action.id}
          variant="outline"
          size="sm"
          onClick={() => handleAction(action.id)}
          className="h-7 gap-1 px-2 text-xs cursor-pointer"
        >
          {action.icon}
          {action.label}
        </Button>
      ))}
    </div>
  );
}
