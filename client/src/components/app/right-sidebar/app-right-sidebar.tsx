import type { ChatBotHandle } from '@/features/companion/components/chat-bot';

import { useRef } from 'react';

import CompanionChat from '@/features/companion/components/companion-chat';

import { useSettingsStore } from '@/store/settings-store';

import { m } from '@/paraglide/messages';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

import { XIcon } from 'lucide-react';

export default function AppRightSidebar({ className }: { className?: string }) {
  const setRightSidebarOpen = useSettingsStore((s) => s.setRightSidebarOpen);
  const chatRef = useRef<ChatBotHandle>(null);

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col bg-sidebar text-sidebar-foreground',
        className,
      )}
    >
      <div className="flex flex-col gap-2 p-2">
        <Button
          variant="ghost"
          size="icon-xs"
          className="h-7 w-7 ml-auto rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-900 text-muted-foreground hover:text-foreground cursor-pointer"
          title={m.sidebar_close_panel()}
          onClick={() => setRightSidebarOpen(false)}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto">
        <CompanionChat chatRef={chatRef} />
      </div>
    </div>
  );
}
