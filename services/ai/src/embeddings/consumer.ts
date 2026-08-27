import amqp, { type ChannelModel, type Channel } from 'amqplib';

import {
	noteBulkDeletedEventSchema,
	noteBulkUpsertedEventSchema,
	noteDeletedEventSchema,
	noteUpsertedEventSchema
} from '@/embeddings/schemas';
import { handleNotesDeleted, handleNotesUpserted } from '@/embeddings/services';
import { env } from '@/config/env';

const NOTE_EXCHANGE = 'note.exchange';
const NOTE_AI_SYNC_QUEUE = 'note.ai-sync.queue';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function startNoteEventsConsumer() {
	connection = await amqp.connect(env.RABBITMQ_URL);
	channel = await connection.createChannel();

	await channel.assertExchange(NOTE_EXCHANGE, 'direct', { durable: true });

	await channel.assertQueue(NOTE_AI_SYNC_QUEUE, {
		arguments: {
			'x-dead-letter-routing-key': 'note.ai-sync.dlq.routing.key',
			'x-dead-letter-exchange': 'note.dlx'
		},
		durable: true
	});

	await channel.bindQueue(NOTE_AI_SYNC_QUEUE, NOTE_EXCHANGE, 'note.created');
	await channel.bindQueue(NOTE_AI_SYNC_QUEUE, NOTE_EXCHANGE, 'note.updated');
	await channel.bindQueue(NOTE_AI_SYNC_QUEUE, NOTE_EXCHANGE, 'note.deleted');

	await channel.prefetch(5); // ! xử lý tối đa 5 message song song, tránh flood Gemini API

	channel.consume(NOTE_AI_SYNC_QUEUE, async (msg) => {
		if (!msg) return;

		try {
			const routingKey = msg.fields.routingKey;
			const payload = JSON.parse(msg.content.toString());

			if (routingKey === 'note.created' || routingKey === 'note.updated') {
				if (payload.notes && Array.isArray(payload.notes)) {
					const parsed = noteBulkUpsertedEventSchema.parse(payload);
					await handleNotesUpserted(parsed.notes);
				} else {
					// * Xử lý sự kiện đơn lẻ (NoteEventPayload)
					const parsed = noteUpsertedEventSchema.parse(payload);
					await handleNotesUpserted(parsed);
				}
			} else if (routingKey === 'note.deleted') {
				// * Xử lý trường hợp nhận sự kiện xóa hàng loạt (NoteBulkDeletedPayload)
				if (payload.noteIds && Array.isArray(payload.noteIds)) {
					const parsed = noteBulkDeletedEventSchema.parse(payload);
					await handleNotesDeleted(parsed.noteIds);
				} else {
					// * Xử lý sự kiện xóa đơn lẻ (NoteDeletedPayload)
					const parsed = noteDeletedEventSchema.parse(payload);
					await handleNotesDeleted(parsed.noteId);
				}
			}

			channel!.ack(msg);
		} catch (err) {
			console.error('[note-events-consumer] Failed to process message', err);
			// requeue = false: đẩy message sang DLQ (nếu có cấu hình DLX)
			channel!.nack(msg, false, false);
		}
	});

	// eslint-disable-next-line no-console
	console.log('[note-events-consumer] Listening on', NOTE_AI_SYNC_QUEUE);
}

export async function stopNoteEventsConsumer() {
	await channel?.close();
	await connection?.close();
}
