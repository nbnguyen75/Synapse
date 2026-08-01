import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { jwt, bearer } from 'better-auth/plugins';
import { betterAuth } from 'better-auth';
import bcrypt from 'bcrypt';

import { verifyUserEmailWhenSignInByGoogle } from '@/auth/repository';
import * as schema from '@/database/schema';
import { db } from '@/database';
import { env } from '@/env';

export const auth = betterAuth({
	plugins: [
		bearer(),
		jwt({
			jwt: {
				definePayload({ user }) {
					return {
						role: user.role ?? 'user',
						email: user.email,
						sub: user.id
					};
				},
				audience: env.PUBLIC_APP_NAME,
				issuer: env.PUBLIC_APP_NAME,
				expirationTime: '15m'
			},
			jwks: {
				keyPairConfig: {
					alg: 'RS256' // Spring Boot natively supports RS256 / ES256
				},
				jwksPath: '/.well-known/jwks.json'
			},
			disableSettingJwtHeader: true
		})
	],
	emailAndPassword: {
		password: {
			verify: async ({ password, hash }) => {
				return bcrypt.compare(password, hash);
			},
			hash: async (password) => {
				return bcrypt.hash(password, 12);
			}
		},
		enabled: true
	},
	databaseHooks: {
		account: {
			create: {
				after: async (account) => {
					if (account.providerId === 'google') {
						await verifyUserEmailWhenSignInByGoogle(account.userId);
					}
				}
			}
		}
	},
	socialProviders: {
		google: {
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			prompt: 'select_account consent',
			clientId: env.GOOGLE_CLIENT_ID
		}
	},
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	appName: env.PUBLIC_APP_NAME,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: env.ORIGINS,
	basePath: '/'
});
