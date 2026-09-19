import { StatusCodes } from 'http-status-codes';

import { Hono } from 'hono';

import {
  noteBulkDeletedEventSchema,
  noteBulkUpsertedEventSchema,
  noteDeletedEventSchema,
  noteUpsertedEventSchema,
} from '@/embeddings/schemas';
import { handleNotesDeleted, handleNotesUpserted } from '@/embeddings/services';

const pubsubRoute = new Hono().basePath('/pubsub').post('/note-events', async (c) => {
  try {
    const body: unknown = await c.req.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('message' in body) ||
      typeof body.message !== 'object' ||
      body.message === null ||
      !('data' in body.message) ||
      typeof body.message.data !== 'string'
    ) {
      return c.text('Invalid Pub/Sub payload', StatusCodes.BAD_REQUEST);
    }

    const rawData = Buffer.from(body.message.data, 'base64').toString('utf-8');
    const payload: unknown = JSON.parse(rawData);

    const eventType =
      'attributes' in body.message &&
      typeof body.message.attributes === 'object' &&
      body.message.attributes !== null &&
      'eventType' in body.message.attributes
        ? body.message.attributes.eventType
        : undefined;

    if (eventType === 'note.created' || eventType === 'note.updated') {
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'notes' in payload &&
        Array.isArray(payload.notes)
      ) {
        const parsed = noteBulkUpsertedEventSchema.parse(payload);
        await handleNotesUpserted(parsed.notes);
      } else {
        const parsed = noteUpsertedEventSchema.parse(payload);
        await handleNotesUpserted(parsed);
      }
    } else if (eventType === 'note.deleted') {
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'noteIds' in payload &&
        Array.isArray(payload.noteIds)
      ) {
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
