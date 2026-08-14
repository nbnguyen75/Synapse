import type { UIMessage } from 'ai';

type UIMessagePart = UIMessage['parts'][number];

const TEXT_FILE_MEDIA_PREFIXES = [
  'text/',
  'application/json',
  'application/xml',
  'application/ld+json',
  'application/csv',
  'application/markdown',
] as const;

export function isTextLikeMediaType(mediaType: string): boolean {
  return TEXT_FILE_MEDIA_PREFIXES.some((prefix) =>
    mediaType.toLowerCase().startsWith(prefix),
  );
}

export function decodeDataUrl(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return '';

  const header = dataUrl.slice(0, commaIndex);
  const encoded = dataUrl.slice(commaIndex + 1);

  try {
    if (/;base64$/i.test(header)) {
      const binary = atob(encoded);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    return decodeURIComponent(encoded);
  } catch {
    return '';
  }
}

export function flattenFilePartsToText(
  parts: UIMessagePart[],
): UIMessagePart[] {
  return parts.flatMap((part) => {
    if (part.type !== 'file') {
      return [part];
    }

    const filename = part.filename || 'attachment';
    if (part.url.startsWith('data:') && isTextLikeMediaType(part.mediaType)) {
      return [
        {
          text: `\n\n[Attachment: ${filename}]\n${decodeDataUrl(part.url)}`,
          type: 'text',
        },
      ];
    }

    return [
      {
        text: `\n\n[Attachment: ${filename} (${part.mediaType})]`,
        type: 'text',
      },
    ];
  });
}
