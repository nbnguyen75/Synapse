import { inArray, sql } from 'drizzle-orm';

import { noteEmbeddings, notes } from '@/database/schema';
import { db } from '@/database';

export type UpsertNoteParams = {
	createdAt: string | null;
	updatedAt: string | null;
	title: string | null;
	trashed: boolean;
	content: string;
	userId: string;
	id: string;
};

export type UpsertNoteEmbeddingParams = {
	embedding: number[] | null;
	noteId: string;
	userId: string;
};

export async function getNotesByIds(noteIds: string[]) {
	if (noteIds.length === 0) return [];

	return db
		.select({
			content: notes.content,
			trashed: notes.trashed,
			title: notes.title,
			id: notes.id
		})
		.from(notes)
		.where(inArray(notes.id, noteIds));
}

export async function bulkUpsertNoteRecords(dataList: UpsertNoteParams[]) {
	if (dataList.length === 0) return;

	return db
		.insert(notes)
		.values(
			dataList.map((data) => ({
				createdAt: data.createdAt ? new Date(data.createdAt) : null,
				updatedAt: data.updatedAt ? new Date(data.updatedAt) : null,
				content: data.content,
				trashed: data.trashed,
				userId: data.userId,
				title: data.title,
				id: data.id
			}))
		)
		.onConflictDoUpdate({
			set: {
				createdAt: sql`EXCLUDED.created_at`,
				updatedAt: sql`EXCLUDED.updated_at`,
				content: sql`EXCLUDED.content`,
				trashed: sql`EXCLUDED.trashed`,
				title: sql`EXCLUDED.title`
			},
			target: notes.id
		});
}

export async function bulkDeleteOnlyEmbeddings(noteIds: string[]) {
	if (noteIds.length === 0) return;

	return db.delete(noteEmbeddings).where(inArray(noteEmbeddings.noteId, noteIds));
}

export async function bulkUpsertNoteEmbeddingRecords(dataList: UpsertNoteEmbeddingParams[]) {
	if (dataList.length === 0) return;

	return db
		.insert(noteEmbeddings)
		.values(
			dataList.map((data) => ({
				embedding: data.embedding,
				noteId: data.noteId,
				userId: data.userId
			}))
		)
		.onConflictDoUpdate({
			set: {
				embedding: sql`EXCLUDED.embedding`
			},
			target: noteEmbeddings.noteId
		});
}

export async function bulkDeleteNotesAndEmbeddings(noteIds: string[]) {
	if (noteIds.length === 0) return;

	return db.transaction(async (tx) => {
		await tx.delete(noteEmbeddings).where(inArray(noteEmbeddings.noteId, noteIds));
		await tx.delete(notes).where(inArray(notes.id, noteIds));
	});
}
