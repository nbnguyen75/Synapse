import { m } from '@/paraglide/messages';

import { BarChart3Icon, HashIcon } from 'lucide-react';

interface CommandPaletteStatsViewProps {
  data: {
    tagsList: string[];
    tagsCount: number;
    pinned: number;
    active: number;
    drafts: number;
    total: number;
  };
}

export default function CommandPaletteStatsView({ data }: CommandPaletteStatsViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-foreground tracking-wide uppercase">
        <BarChart3Icon className="h-3.5 w-3.5 text-primary" />
        <span>{m.command_palette_stats_title()}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: m.command_palette_stats_total(), value: data.total },
          { label: m.command_palette_stats_pinned(), value: data.pinned },
          { label: m.command_palette_stats_active(), value: data.active },
          { label: m.command_palette_stats_drafts(), value: data.drafts },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border/50 bg-card/50 p-3 flex flex-col"
          >
            <span className="text-[10px] text-muted-foreground font-medium">{stat.label}</span>
            <span className="text-xl font-bold text-foreground mt-1">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 p-3.5 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <HashIcon className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{m.command_palette_stats_tags({ count: data.tagsCount })}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {data.tagsList.length > 0 ? (
            data.tagsList.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-muted/70 text-muted-foreground border border-border/40"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground/70 italic">
              {m.command_palette_stats_no_tags()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
