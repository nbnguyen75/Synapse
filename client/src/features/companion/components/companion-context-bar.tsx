import { useCallback } from 'react';

import { toast } from 'sonner';

import { useCompanionContextStore } from '@/store/companion-context-store';

import { m } from '@/paraglide/messages';

import { Button } from '@/components/ui/button';

import { CopyIcon, FileTextIcon } from 'lucide-react';

export default function CompanionContextBar() {
  const activeDocument = useCompanionContextStore(
    (state) => state.activeDocument,
  );

  const handleCopy = useCallback(async () => {
    if (!activeDocument) return;
    await navigator.clipboard.writeText(activeDocument.content);
    toast.success(m.companion_context_copied());
  }, [activeDocument]);

  if (!activeDocument) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-background/60 px-2.5 py-2">
      <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-foreground">
          {activeDocument.title || m.companion_context_untitled()}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {m.companion_context_chars({ count: activeDocument.content.length })}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={m.companion_context_copy()}
        title={m.companion_context_copy()}
        onClick={handleCopy}
        className="shrink-0 cursor-pointer"
      >
        <CopyIcon className="size-3.5" />
      </Button>
    </div>
  );
}
