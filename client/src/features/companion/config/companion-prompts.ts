import type { CompanionActiveDocument } from '@/store/companion-context-store';

import { getLocale } from '@/paraglide/runtime';

export const COMPANION_CONTEXT_TRUNCATE_CHARS = 4000;

export const QUICK_ACTION_IDS = [
  'summarize',
  'translate',
  'polish',
  'ask',
] as const;

export type QuickActionId = (typeof QUICK_ACTION_IDS)[number];

const truncate = (content: string, max = COMPANION_CONTEXT_TRUNCATE_CHARS) =>
  content.length > max ? `${content.slice(0, max)}…` : content;

const withDocument = (doc: CompanionActiveDocument, instruction: string) =>
  `${instruction}\n\nTitle: ${doc.title || '(untitled)'}\n\n${truncate(doc.content)}`;

export function buildQuickActionPrompt(
  id: QuickActionId,
  doc: CompanionActiveDocument,
): string {
  switch (id) {
    case 'summarize':
      return withDocument(
        doc,
        'Summarize the following note into concise bullet points. Preserve all key facts and numbers.',
      );
    case 'translate':
      return withDocument(
        doc,
        `Translate the following note into ${getLocale() === 'vi' ? 'Vietnamese' : 'English'}. Keep headings, lists and code blocks intact.`,
      );
    case 'polish':
      return withDocument(
        doc,
        'Polish the following note: fix grammar and typos, improve clarity, keep the original structure and meaning.',
      );
    case 'ask':
      return withDocument(
        doc,
        'Read the following note carefully. I will ask follow-up questions about it — please answer based only on this content.',
      );
  }
}
