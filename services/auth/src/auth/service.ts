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
		// oAuthProxy({
		// 	productionURL: env.FRONTEND_URL
		// }),
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
				audience: env.APP_NAME,
				expirationTime: '15m',
				issuer: env.APP_NAME
			},
			jwks: {
				keyPairConfig: {
					alg: 'RS256'
				},
				jwksPath: '/.well-known/jwks.json'
			},
			disableSettingJwtHeader: true
		})
	],
	socialProviders: {
		google: {
			// redirectURI: `${env.FRONTEND_URL}/api/auth/callback/google`,
			redirectURI: `${env.BETTER_AUTH_URL}/api/v1/auth/callback/google`,
			clientSecret: env.GOOGLE_CLIENT_SECRET,
			prompt: 'select_account consent',
			clientId: env.GOOGLE_CLIENT_ID
		}
	},
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
	session: {
		cookieCache: {
			maxAge: 5 * 60, // cache 5 mins
			enabled: true
		},
		deferSessionRefresh: true
	},
	trustedOrigins: [env.FRONTEND_URL, ...env.BETTER_AUTH_TRUSTED_ORIGINS],
	database: drizzleAdapter(db, {
		provider: 'pg',
		schema
	}),
	baseURL: env.BETTER_AUTH_URL,
	appName: env.APP_NAME,
	basePath: '/'
});
