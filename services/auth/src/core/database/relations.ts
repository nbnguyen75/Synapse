import { defineRelations } from 'drizzle-orm';

import * as schema from '#/core/database/schema';

export const relations = defineRelations(schema, (r) => ({
	oauthAccessToken: {
		oauthRefreshToken: r.one.oauthRefreshToken({
			from: r.oauthAccessToken.refreshId,
			to: r.oauthRefreshToken.id
		}),
		oauthClient: r.one.oauthClient({
			from: r.oauthAccessToken.clientId,
			to: r.oauthClient.clientId
		}),
		session: r.one.session({
			from: r.oauthAccessToken.sessionId,
			to: r.session.id
		}),
		user: r.one.user({
			from: r.oauthAccessToken.userId,
			to: r.user.id
		})
	},

	oauthRefreshToken: {
		oauthClient: r.one.oauthClient({
			from: r.oauthRefreshToken.clientId,
			to: r.oauthClient.clientId
		}),
		session: r.one.session({
			from: r.oauthRefreshToken.sessionId,
			to: r.session.id
		}),
		user: r.one.user({
			from: r.oauthRefreshToken.userId,
			to: r.user.id
		}),
		oauthAccessTokens: r.many.oauthAccessToken()
	},

	user: {
		oauthRefreshTokens: r.many.oauthRefreshToken(),
		oauthAccessTokens: r.many.oauthAccessToken(),
		oauthConsents: r.many.oauthConsent(),
		oauthClients: r.many.oauthClient(),
		accounts: r.many.account(),
		sessions: r.many.session()
	},

	oauthClient: {
		user: r.one.user({
			from: r.oauthClient.userId,
			to: r.user.id
		}),
		oauthRefreshTokens: r.many.oauthRefreshToken(),
		oauthAccessTokens: r.many.oauthAccessToken(),
		oauthConsents: r.many.oauthConsent()
	},

	oauthConsent: {
		oauthClient: r.one.oauthClient({
			from: r.oauthConsent.clientId,
			to: r.oauthClient.clientId
		}),
		user: r.one.user({
			from: r.oauthConsent.userId,
			to: r.user.id
		})
	},

	session: {
		user: r.one.user({
			from: r.session.userId,
			to: r.user.id
		}),
		oauthRefreshTokens: r.many.oauthRefreshToken(),
		oauthAccessTokens: r.many.oauthAccessToken()
	},

	account: {
		user: r.one.user({
			from: r.account.userId,
			to: r.user.id
		})
	}
}));
