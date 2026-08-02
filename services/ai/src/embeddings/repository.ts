import { eq } from 'drizzle-orm';

import { noteEmbeddings, notes } from '@/database/schema';
import { db } from '@/database';

export type UpsertNoteParams = {
	title: string | null;
	trashed: boolean;
	content: string;
	userId: string;
	id: string;
};

export type UpsertNoteEmbeddingParams = {
	embedding: number[];
	noteId: string;
	userId: string;
};

export async function upsertNoteRecord(data: UpsertNoteParams) {
	return db
		.insert(notes)
		.values({
			content: data.content,
			trashed: data.trashed,
			updatedAt: new Date(),
			userId: data.userId,
			title: data.title,
			id: data.id
		})
		.onConflictDoUpdate({
			set: {
				content: data.content,
				trashed: data.trashed,
				updatedAt: new Date(),
				title: data.title
			},
			target: notes.id
		});
}

export async function upsertNoteEmbeddingRecord(data: UpsertNoteEmbeddingParams) {
	return db
		.insert(noteEmbeddings)
		.values({
			embedding: data.embedding,
			noteId: data.noteId,
			userId: data.userId
		})
		.onConflictDoUpdate({
			set: {
				embedding: data.embedding
			},
			target: noteEmbeddings.noteId
		});
}

export async function deleteNoteAndEmbeddingRecords(noteId: string) {
	return db.transaction(async (tx) => {
		await tx.delete(noteEmbeddings).where(eq(noteEmbeddings.noteId, noteId));
		await tx.delete(notes).where(eq(notes.id, noteId));
	});
}
