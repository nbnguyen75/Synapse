import { format } from 'date-fns';
import { toast } from 'sonner';
import { z } from 'zod';

import { m } from '@/paraglide/messages';

export const DEFAULT_NOTES_SEARCH = {
   sort: 'updatedAt_desc',
   pageSize: 10,
   tag: '',
   page: 1,
   q: '',
};

export const notesSearchSchema = z.object({
   pageSize: z.number().default(DEFAULT_NOTES_SEARCH.pageSize),
   sort: z.string().default(DEFAULT_NOTES_SEARCH.sort),
   page: z.number().default(DEFAULT_NOTES_SEARCH.page),
   tag: z.string().default(DEFAULT_NOTES_SEARCH.tag),
   view: z.enum(['active', 'archived']).optional(),
   q: z.string().default(DEFAULT_NOTES_SEARCH.q),
});

export type NotesSearch = z.infer<typeof notesSearchSchema>;

export const TAG_COLORS = [
   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
   'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800',
   'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
   'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800',
   'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800',
   'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800',
];

export function getTagColor(tag: string): string {
   let hash = 0;
   for (const char of tag) {
      hash = (hash << 5) - hash + char.charCodeAt(0);
      hash |= 0;
   }
   return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export function formatDate(dateStr: string): string {
   return format(new Date(dateStr), 'MMM d, yyyy');
}

export function getReadTime(content: string): string {
   const words = (content || '').trim().split(/\s+/).filter(Boolean).length;
   const minutes = Math.max(1, Math.ceil(words / 200));
   return m.notes_page_card_read_time({ minutes: String(minutes) });
}

export function exportMarkdown(title: string, content: string) {
   const blob = new Blob([`# ${title.trim()}\n\n${content || ''}`], {
      type: 'text/markdown;charset=utf-8;',
   });
   const url = URL.createObjectURL(blob);
   const link = document.createElement('a');
   link.href = url;
   link.download = `${
      title
         .trim()
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-') || 'note'
   }.md`;
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
   toast.success(m.notes_page_toast_exported());
}

export const SORT_OPTIONS = [
   { labelKey: 'notes_page_sort_updated' as const, value: 'updatedAt_desc' },
   {
      labelKey: 'notes_page_sort_created_new' as const,
      value: 'createdAt_desc',
   },
   { labelKey: 'notes_page_sort_created_old' as const, value: 'createdAt_asc' },
   { labelKey: 'notes_page_sort_title_az' as const, value: 'title_asc' },
   { labelKey: 'notes_page_sort_title_za' as const, value: 'title_desc' },
   { labelKey: 'notes_page_sort_read_long' as const, value: 'readTime_desc' },
   { labelKey: 'notes_page_sort_read_short' as const, value: 'readTime_asc' },
] as const;
