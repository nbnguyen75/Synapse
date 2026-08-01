import type { ErrorHandler, NotFoundHandler } from 'hono';

import { StatusCodes } from 'http-status-codes';
import { APICallError } from 'ai';
import { ZodError } from 'zod/v4';

import { HTTPException } from 'hono/http-exception';

import { fail } from '@/middleware/responses';
import { AppError } from '@/lib/errors';

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof AppError) {
		return fail(c, err.errorCode, err.message, err.status, err.details);
	}

	if (err instanceof HTTPException) {
		const code =
			err.status === StatusCodes.UNAUTHORIZED
				? 'UNAUTHORIZED'
				: err.status === StatusCodes.METHOD_NOT_ALLOWED
					? 'METHOD_NOT_ALLOWED'
					: 'VALIDATION_ERROR';

		return fail(c, code, 'Something went sideways in transit.', err.status as StatusCodes);
	}

	if (err instanceof ZodError) {
		const details = err.issues.map((issue) => ({
			field: issue.path.join('.'),
			message: issue.message
		}));

		return fail(
			c,
			'VALIDATION_ERROR',
			'The data you sent and the shape we expected are not on speaking terms.',
			StatusCodes.BAD_REQUEST,
			details
		);
	}

	if (APICallError.isInstance(err) && err.statusCode === StatusCodes.TOO_MANY_REQUESTS) {
		return fail(
			c,
			'TOO_MANY_REQUESTS',
			'AI needs a coffee break. Try again in a bit.',
			StatusCodes.TOO_MANY_REQUESTS
		);
	}

	if (err.message.includes('ECONNREFUSED') || err.message.includes('connect')) {
		console.error('[DB Connection Error]', err);
		return fail(
			c,
			'SERVICE_UNAVAILABLE',
			'The database is playing hide and seek right now.',
			StatusCodes.SERVICE_UNAVAILABLE
		);
	}

	console.error(`[Unhandled Error] ${err.message}`, err.stack);
	return fail(
		c,
		'INTERNAL_ERROR',
		'Well, this is embarrassing. We broke something.',
		StatusCodes.INTERNAL_SERVER_ERROR
	);
};

export const notFoundHandler: NotFoundHandler = (c) => {
	return fail(
		c,
		'ROUTE_NOT_FOUND',
		`Route ${c.req.method} ${c.req.path} not found`,
		StatusCodes.NOT_FOUND
	);
};
