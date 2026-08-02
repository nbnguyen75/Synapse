import { and, eq, sql } from 'drizzle-orm';

import { noteEmbeddings, notes } from '@/database/schema';
import { db } from '@/database';
export type SimilarNote = {
	title: string | null;
	similarity: number;
	content: string;
	id: string;
};

export async function findTopKSimilarNotes(
	userId: string,
	queryEmbedding: number[],
	k: number
): Promise<SimilarNote[]> {
	const embeddingStr = JSON.stringify(queryEmbedding);
	const similarity = sql<number>`1 - (${noteEmbeddings.embedding} <=> ${embeddingStr}::vector)`;

	return db
		.select({
			content: notes.content,
			title: notes.title,
			id: notes.id,
			similarity
		})
		.from(noteEmbeddings)
		.innerJoin(notes, eq(noteEmbeddings.noteId, notes.id))
		.where(and(eq(noteEmbeddings.userId, userId), eq(notes.trashed, false)))
		.orderBy(sql`${noteEmbeddings.embedding} <=> ${embeddingStr}::vector`)
		.limit(k);
}
