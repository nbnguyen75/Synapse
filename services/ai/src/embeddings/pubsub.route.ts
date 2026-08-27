import { StatusCodes } from 'http-status-codes';

import { Hono } from 'hono';

import {
	noteBulkDeletedEventSchema,
	noteBulkUpsertedEventSchema,
	noteDeletedEventSchema,
	noteUpsertedEventSchema
} from '@/embeddings/schemas';
import { handleNotesDeleted, handleNotesUpserted } from '@/embeddings/services';

const pubsubRoute = new Hono().basePath('/pubsub').post('/note-events', async (c) => {
	try {
		const body = await c.req.json();

		if (!body?.message?.data) {
			return c.text('Invalid Pub/Sub payload', StatusCodes.BAD_REQUEST);
		}

		const rawData = Buffer.from(body.message.data, 'base64').toString('utf-8');
		const payload = JSON.parse(rawData);

		const eventType = body.message.attributes?.eventType;

		if (eventType === 'note.created' || eventType === 'note.updated') {
			if (payload.notes && Array.isArray(payload.notes)) {
				const parsed = noteBulkUpsertedEventSchema.parse(payload);
				await handleNotesUpserted(parsed.notes);
			} else {
				const parsed = noteUpsertedEventSchema.parse(payload);
				await handleNotesUpserted(parsed);
			}
		} else if (eventType === 'note.deleted') {
			if (payload.noteIds && Array.isArray(payload.noteIds)) {
				const parsed = noteBulkDeletedEventSchema.parse(payload);
				await handleNotesDeleted(parsed.noteIds);
			} else {
				const parsed = noteDeletedEventSchema.parse(payload);
				await handleNotesDeleted(parsed.noteId);
			}
		} else {
			console.warn('[pubsub-handler] Unknown eventType:', eventType);
		}

		return c.text('OK', StatusCodes.OK);
	} catch (err) {
		console.error('[pubsub-handler] Failed to process message', err);
		return c.text('Internal Server Error', StatusCodes.INTERNAL_SERVER_ERROR);
	}
});

export default pubsubRoute;
