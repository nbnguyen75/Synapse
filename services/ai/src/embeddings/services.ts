import {
	deleteNoteAndEmbeddingRecords,
	upsertNoteEmbeddingRecord,
	upsertNoteRecord
} from '@/embeddings/repository';
import { MAX_EMBEDDING_INPUT_LENGTH } from '@/embeddings/constants';
import { MAX_TITLE_LENGTH } from '@/generator';
import { embedText } from '@/lib/ai';

export async function handleNoteUpserted(
	noteId: string,
	userId: string,
	title: string | null,
	content: string,
	trashed: boolean
) {
	if (trashed || !content.trim()) {
		await deleteNoteAndEmbeddingRecords(noteId);
		return;
	}

	await upsertNoteRecord({
		id: noteId,
		content,
		trashed,
		userId,
		title
	});

	const textToEmbed = title ? `${title}\n${content}` : content;
	const safeContent = textToEmbed.slice(0, MAX_EMBEDDING_INPUT_LENGTH + MAX_TITLE_LENGTH);
	const embedding = await embedText(safeContent);

	await upsertNoteEmbeddingRecord({
		embedding,
		noteId,
		userId
	});
}

export async function handleNoteDeleted(noteId: string) {
	await deleteNoteAndEmbeddingRecords(noteId);
}
