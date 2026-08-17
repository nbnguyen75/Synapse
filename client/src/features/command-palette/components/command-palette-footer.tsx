import { Kbd } from '@/components/ui/kbd';

export default function CommandPaletteFooter() {
  return (
    <div className="flex items-center justify-between border-t border-border/40 px-4 py-2 bg-muted/20 text-[11px] text-muted-foreground select-none">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1">
          <Kbd className="text-[10px] px-1 py-0.5">↑↓</Kbd> Navigate
        </span>
        <span className="flex items-center gap-1">
          <Kbd className="text-[10px] px-1 py-0.5">↵</Kbd> Select
        </span>
        <span className="flex items-center gap-1">
          <Kbd className="text-[10px] px-1 py-0.5">&gt;</Kbd> Cmd Filter
        </span>
      </div>
      <span className="flex items-center gap-1">
        <Kbd className="text-[10px] px-1 py-0.5">Esc</Kbd> Close
      </span>
    </div>
  );
}
