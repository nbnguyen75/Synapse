import amqp, { type ChannelModel, type Channel } from 'amqplib';

import { noteDeletedEventSchema, noteUpsertedEventSchema } from '@/embeddings/schemas';
import { handleNoteDeleted, handleNoteUpserted } from '@/embeddings/services';
import { env } from '@/env';

const EXCHANGE = 'note.events';
const QUEUE = 'ai-service.note-events';

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function startNoteEventsConsumer() {
	connection = await amqp.connect(env.RABBITMQ_URL);
	channel = await connection.createChannel();

	await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
	await channel.assertQueue(QUEUE, { durable: true });

	await channel.bindQueue(QUEUE, EXCHANGE, 'note.created');
	await channel.bindQueue(QUEUE, EXCHANGE, 'note.updated');
	await channel.bindQueue(QUEUE, EXCHANGE, 'note.deleted');

	await channel.prefetch(5); // xử lý tối đa 5 message song song, tránh flood Gemini API

	channel.consume(QUEUE, async (msg) => {
		if (!msg) return;

		try {
			const routingKey = msg.fields.routingKey;
			const payload = JSON.parse(msg.content.toString());

			if (routingKey === 'note.created' || routingKey === 'note.updated') {
				const parsed = noteUpsertedEventSchema.parse(payload);
				await handleNoteUpserted(
					parsed.noteId,
					parsed.userId,
					parsed.title ?? null,
					parsed.content,
					parsed.trashed
				);
			} else if (routingKey === 'note.deleted') {
				const parsed = noteDeletedEventSchema.parse(payload);
				await handleNoteDeleted(parsed.noteId);
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
