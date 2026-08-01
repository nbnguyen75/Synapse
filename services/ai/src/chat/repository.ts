import { eq, sql } from 'drizzle-orm';

import { notes } from '@/database/schema';
import { db } from '@/database';

export async function findTopKSimilarNotes(userId: string, queryEmbedding: number[], k: number) {
	const embeddingStr = JSON.stringify(queryEmbedding);
	const similarity = sql<number>`1 - (${notes.embedding} <=> ${embeddingStr}::vector)`;

	return db
		.select({ content: notes.content, title: notes.title, id: notes.id, similarity })
		.from(notes)
		.where(eq(notes.userId, userId))
		.orderBy(sql`${notes.embedding} <=> ${embeddingStr}::vector`)
		.limit(k);
}
