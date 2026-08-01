import type { Env } from '@/types/shared';

import { createRemoteJWKSet, jwtVerify } from 'jose';
import { StatusCodes } from 'http-status-codes';

import { createMiddleware } from 'hono/factory';

import { AppError } from '@/lib/errors';
import { env } from '@/env';

const JWKS = createRemoteJWKSet(new URL(env.AUTH_JWKS_URL));

export const authJwksMiddleware = createMiddleware<Env>(async (c, next) => {
	const authHeader = c.req.header('Authorization');
	if (!authHeader?.startsWith('Bearer '))
		throw new AppError('UNAUTHORIZED', 'Missing token', StatusCodes.UNAUTHORIZED);

	const token = authHeader.slice(7);
	try {
		const { payload } = await jwtVerify(token, JWKS, {
			audience: env.PUBLIC_APP_NAME,
			issuer: env.PUBLIC_APP_NAME
		});
		c.set('userId', payload.sub as string);
		await next();
	} catch {
		throw new AppError('UNAUTHORIZED', 'Invalid or expired token', StatusCodes.UNAUTHORIZED);
	}
});
