import { safeValidateUIMessages, type UIMessage } from 'ai';

import { dataPartSchema, messageMetadataSchema } from '@/chat/schemas';

export async function validateChatMessages(message: unknown) {
	return safeValidateUIMessages({
		dataSchemas: { note_sources: dataPartSchema },
		metadataSchema: messageMetadataSchema,
		messages: [message]
	});
}

export function extractQuestionText(message: UIMessage): string {
	return message.parts
		.filter((p) => p.type === 'text')
		.map((p) => p.text)
		.join(' ');
}

export function cleanPartsForStorage(parts: UIMessage['parts']): UIMessage['parts'] {
	if (!Array.isArray(parts)) return [];

	return parts.filter((part) => {
		if ((part.type as string) === 'step-start' || (part.type as string) === 'step-finish') {
			return false;
		}

		if (part.type === 'text') {
			return typeof part.text === 'string' && part.text.trim().length > 0;
		}

		if (part.type === 'tool-invocation') {
			return true;
		}

		return false;
	});
}

interface SanitizeOptions {
	stripOldAttachments?: boolean;
	maxHistory?: number;
}

export function sanitizeMessages(messages: UIMessage[], options: SanitizeOptions = {}) {
	const { stripOldAttachments = true, maxHistory = 10 } = options;

	if (messages.length === 0) return [];

	const recentMessages = messages.slice(-maxHistory);
	const sanitized: UIMessage[] = [];
	const lastIndex = recentMessages.length - 1;

	for (let i = 0; i < recentMessages.length; i++) {
		const msg = recentMessages[i];
		if (!Array.isArray(msg.parts) || msg.parts.length === 0) continue;

		const isLatestMessage = i === lastIndex;

		const cleanedParts = msg.parts.filter((part) => {
			if (part.type === 'text') {
				return typeof part.text === 'string' && part.text.trim().length > 0;
			}

			if (!isLatestMessage && stripOldAttachments && part.type === 'file') {
				return false;
			}

			if (part.type === 'tool-invocation') {
				return part.state === 'output-available';
			}

			return false;
		});

		if (cleanedParts.length === 0) continue;

		sanitized.push({
			parts: cleanedParts,
			role: msg.role,
			id: msg.id
		});
	}

	let trimmed = sanitized.slice(-maxHistory);

	const firstUserIdx = trimmed.findIndex((m) => m.role === 'user');
	if (firstUserIdx > 0) {
		trimmed = trimmed.slice(firstUserIdx);
	} else if (firstUserIdx === -1) {
		return [];
	}

	return trimmed;
}
