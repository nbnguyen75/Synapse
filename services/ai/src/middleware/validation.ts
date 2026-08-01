import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';

import { zValidator as zv } from '@hono/zod-validator';
import { StatusCodes } from 'http-status-codes';

import { fail } from '@/middleware/responses';

export function zValidator<T extends ZodType, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T
) {
	return zv(target, schema, (result, c) => {
		if (!result.success) {
			const details = result.error.issues.map((issue) => ({
				field: issue.path.join('.'),
				message: issue.message
			}));

			return fail(
				c,
				'VALIDATION_ERROR',
				'The database is playing hide and seek right now.',
				StatusCodes.BAD_REQUEST,
				details
			);
		}
	});
}
