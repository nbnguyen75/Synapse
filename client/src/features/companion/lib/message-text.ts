import type { UIMessage } from 'ai';

import { decodeDataUrl, isTextLikeMediaType } from '@/features/companion/utils/file-parts';

export function getCopyableMessageText(message: UIMessage): string {
  const sections: Array<string> = [];

  for (const part of message.parts) {
    if (part.type === 'text') {
      sections.push(part.text);
    } else if (
      part.type === 'file' &&
      part.url.startsWith('data:') &&
      isTextLikeMediaType(part.mediaType)
    ) {
      sections.push(`[${part.filename ?? 'Attachment'}]\n${decodeDataUrl(part.url)}`);
    }
  }

  return sections.join('\n\n');
}
