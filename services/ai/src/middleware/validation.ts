import type { ValidationTargets } from 'hono';
import type { ZodType } from 'zod';

import { zValidator as zv } from '@hono/zod-validator';
import { StatusCodes } from 'http-status-codes';
import z from 'zod/v4';

import { fail } from '@/middleware/responses';

export function zValidator<T extends ZodType, Target extends keyof ValidationTargets>(
	target: Target,
	schema: T
) {
	return zv(target, schema, (result, c) => {
		if (!result.success) {
			return fail(
				c,
				'VALIDATION_ERROR',
				'Invalid request',
				StatusCodes.BAD_REQUEST,
				z.treeifyError(result.error)
			);
		}
	});
}
