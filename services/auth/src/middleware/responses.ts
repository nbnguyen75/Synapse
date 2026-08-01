import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { ApiResponse } from '@/types/shared';
import type { Context } from 'hono';

import { StatusCodes } from 'http-status-codes';

export function ok<T>(c: Context, data: T, status = StatusCodes.OK) {
	const body: ApiResponse<T> = {
		timestamp: new Date().toISOString(),
		success: true,
		data
	};
	return c.json(body, status as ContentfulStatusCode);
}

export function fail(
	c: Context,
	errorCode: string,
	message: string,
	status = StatusCodes.BAD_REQUEST,
	details: unknown = null
) {
	const body: ApiResponse<never> = {
		timestamp: new Date().toISOString(),
		success: false,
		errorCode,
		details,
		message
	};

	return c.json(body, status as ContentfulStatusCode);
}
