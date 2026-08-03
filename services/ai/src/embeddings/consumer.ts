import amqp, { type ChannelModel, type Channel } from 'amqplib';

import {
	noteBulkDeletedEventSchema,
	noteBulkUpsertedEventSchema,
	noteDeletedEventSchema,
	noteUpsertedEventSchema
} from '@/embeddings/schemas';
import { handleNotesDeleted, handleNotesUpserted } from '@/embeddings/services';
import { env } from '@/env';

const EXCHANGE = 'note.exchange';
const QUEUE = 'note.ai-sync.queue';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function startNoteEventsConsumer() {
	connection = await amqp.connect(env.RABBITMQ_URL);
	channel = await connection.createChannel();

	await channel.assertExchange(EXCHANGE, 'direct', { durable: true });

	await channel.assertQueue(QUEUE, {
		arguments: {
			'x-dead-letter-routing-key': 'note.ai-sync.dlq.routing.key',
			'x-dead-letter-exchange': 'note.dlx'
		},
		durable: true
	});

	await channel.bindQueue(QUEUE, EXCHANGE, 'note.created');
	await channel.bindQueue(QUEUE, EXCHANGE, 'note.updated');
	await channel.bindQueue(QUEUE, EXCHANGE, 'note.deleted');

	await channel.prefetch(5); // ! xử lý tối đa 5 message song song, tránh flood Gemini API

	channel.consume(QUEUE, async (msg) => {
		if (!msg) return;

		try {
			const routingKey = msg.fields.routingKey;
			const payload = JSON.parse(msg.content.toString());

			if (routingKey === 'note.created' || routingKey === 'note.updated') {
				// * Xử lý trường hợp nhận sự kiện cập nhật hàng loạt (NoteBulkUpdatedPayload)
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
			// requeue = false: tránh vòng lặp vô hạn nếu message lỗi liên tục (poison message)
			channel!.nack(msg, false, false);
		}
	});

	// eslint-disable-next-line no-console
	console.log('[note-events-consumer] Listening on', QUEUE);
}

export async function stopNoteEventsConsumer() {
	await channel?.close();
	await connection?.close();
}
