import type { ErrorHandler, NotFoundHandler } from 'hono';

import { StatusCodes } from 'http-status-codes';
import z, { ZodError } from 'zod/v4';

import { HTTPException } from 'hono/http-exception';

import { fail } from '@/middleware/responses';
import { AppError } from '@/lib/errors';

export const errorHandler: ErrorHandler = (err, c) => {
	if (err instanceof AppError) {
		return fail(c, err.errorCode, err.message, err.status, err.details);
	}

	if (err instanceof HTTPException) {
		return fail(c, 'HTTP_ERROR', err.message, err.status as StatusCodes);
	}

	if (err instanceof ZodError) {
		return fail(
			c,
			'VALIDATION_ERROR',
			'Invalid request',
			StatusCodes.BAD_REQUEST,
			z.treeifyError(err)
		);
	}

	if (/429|rate limit/i.test(err.message)) {
		return fail(
			c,
			'TOO_MANY_REQUESTS',
			'AI provider rate limit hit, try again shortly',
			StatusCodes.TOO_MANY_REQUESTS
		);
	}

	if (err.message.includes('ECONNREFUSED') || err.message.includes('connect')) {
		console.error('[DB Connection Error]', err);
		return fail(
			c,
			'SERVICE_UNAVAILABLE',
			'Database temporarily unavailable',
			StatusCodes.SERVICE_UNAVAILABLE
		);
	}

	console.error(`[Unhandled Error] ${err.message}`, err.stack);
	return fail(c, 'INTERNAL_ERROR', 'Internal server error', StatusCodes.INTERNAL_SERVER_ERROR);
};

export const notFoundHandler: NotFoundHandler = (c) => {
	return fail(
		c,
		'ROUTE_NOT_FOUND',
		`Route ${c.req.method} ${c.req.path} not found`,
		StatusCodes.NOT_FOUND
	);
};
