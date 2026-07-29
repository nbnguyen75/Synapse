import type { Note } from '@/features/notes/types';

import strip from 'strip-markdown';
import { remark } from 'remark';

import { m } from '@/paraglide/messages';

export async function getMarkdownReadTime(content?: string | null, wpm = 200) {
  const file = await remark()
    .use(strip)
    .process(content || '');
  const text = String(file);

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / wpm));

  return m.notes_page_card_read_time({ minutes: String(minutes) });
}

export function getMarkdownReadTimeSync(content?: string | null, wpm = 200) {
  const file = remark()
    .use(strip)
    .processSync(content || '');
  const text = String(file);

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  const minutes = Math.max(1, Math.ceil(words / wpm));

  return m.notes_page_card_read_time({ minutes: String(minutes) });
}

export function exportMarkdown({ content, title }: Note): void {
  const safeTitle = title?.trim() || 'Untitled';
  const filename = deriveFilename(safeTitle);
  const fileContent = `# ${safeTitle}\n\n${content?.trim() || ''}`;

  let url: string | null = null;

  try {
    const blob = new Blob([fileContent], {
      type: 'text/markdown;charset=utf-8;',
    });
    url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.rel = 'noopener';
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    if (url) {
      // give the browser a tick to pick up the download before revoking
      setTimeout(() => URL.revokeObjectURL(url as string), 100);
    }
  }
}

function deriveFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes

  return `${slug || 'note'}.md`;
}

export async function countWordsMarkdown(markdown?: string | null) {
  const file = await remark()
    .use(strip)
    .process(markdown ?? '');

  const text = String(file);

  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function countWordsMarkdownSync(markdown?: string | null) {
  const file = remark()
    .use(strip)
    .processSync(markdown ?? '');

  const text = String(file);

  return text.trim().split(/\s+/).filter(Boolean).length;
}
