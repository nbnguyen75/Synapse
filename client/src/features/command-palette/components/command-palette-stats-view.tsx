import { m } from '@/paraglide/messages';

import { BarChart2Icon } from 'lucide-react';

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

export default function CommandPaletteStatsView({
  data,
}: CommandPaletteStatsViewProps) {
  return (
    <div className="space-y-4">
      <div className="text-emerald-500 font-bold border-b border-border pb-1.5 flex items-center gap-1.5">
        <BarChart2Icon className="h-4 w-4" />
        <span>{m.command_palette_stats_title()}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          {
            label: m.command_palette_stats_total(),
            color: 'text-foreground',
            value: data.total,
          },
          {
            label: m.command_palette_stats_pinned(),
            color: 'text-amber-500',
            value: data.pinned,
          },
          {
            label: m.command_palette_stats_active(),
            color: 'text-emerald-500',
            value: data.active,
          },
          {
            label: m.command_palette_stats_drafts(),
            color: 'text-blue-500',
            value: data.drafts,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-muted/30 border border-border/80 rounded-xl p-3.5 flex flex-col justify-center"
          >
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">
              {stat.label}
            </span>
            <span className={`text-2xl font-extrabold ${stat.color}`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-muted/20 border border-border p-3.5 rounded-xl space-y-1.5">
        <span className="text-[10px] text-muted-foreground font-bold uppercase block">
          {m.command_palette_stats_tags({ count: data.tagsCount })}
        </span>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {data.tagsList.length > 0 ? (
            data.tagsList.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 text-[10px] bg-muted/50 border border-border text-muted-foreground rounded font-semibold"
              >
                #{t}
              </span>
            ))
          ) : (
            <span className="text-muted-foreground text-[10px]">
              {m.command_palette_stats_no_tags()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
