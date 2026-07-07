import { pgTable, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	updatedAt: timestamp('updated_at')
		.$onUpdate(() => new Date())
		.notNull(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	createdAt: timestamp('created_at').notNull(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	id: text('id').primaryKey(),
	image: text('image')
});

export const session = pgTable(
	'session',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
		createdAt: timestamp('created_at').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		id: text('id').primaryKey()
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
	'account',
	{
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		createdAt: timestamp('created_at').notNull(),
		providerId: text('provider_id').notNull(),
		accountId: text('account_id').notNull(),
		refreshToken: text('refresh_token'),
		accessToken: text('access_token'),
		id: text('id').primaryKey(),
		password: text('password'),
		idToken: text('id_token'),
		scope: text('scope')
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
	'verification',
	{
		updatedAt: timestamp('updated_at')
			.$onUpdate(() => new Date())
			.notNull(),
		createdAt: timestamp('created_at').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		id: text('id').primaryKey()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const jwks = pgTable('jwks', {
	createdAt: timestamp('created_at').notNull(),
	privateKey: text('private_key').notNull(),
	publicKey: text('public_key').notNull(),
	expiresAt: timestamp('expires_at'),
	id: text('id').primaryKey()
});

export const oauthClient = pgTable(
	'oauth_client',
	{
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		postLogoutRedirectUris: text('post_logout_redirect_uris').array(),
		tokenEndpointAuthMethod: text('token_endpoint_auth_method'),
		redirectUris: text('redirect_uris').array().notNull(),
		enableEndSession: boolean('enable_end_session'),
		clientId: text('client_id').notNull().unique(),
		responseTypes: text('response_types').array(),
		softwareStatement: text('software_statement'),
		disabled: boolean('disabled').default(false),
		softwareVersion: text('software_version'),
		grantTypes: text('grant_types').array(),
		requirePKCE: boolean('require_pkce'),
		skipConsent: boolean('skip_consent'),
		clientSecret: text('client_secret'),
		contacts: text('contacts').array(),
		createdAt: timestamp('created_at'),
		updatedAt: timestamp('updated_at'),
		referenceId: text('reference_id'),
		subjectType: text('subject_type'),
		softwareId: text('software_id'),
		scopes: text('scopes').array(),
		id: text('id').primaryKey(),
		metadata: jsonb('metadata'),
		public: boolean('public'),
		policy: text('policy'),
		icon: text('icon'),
		name: text('name'),
		type: text('type'),
		tos: text('tos'),
		uri: text('uri')
	},
	(table) => [index('oauthClient_userId_idx').on(table.userId)]
);

export const oauthRefreshToken = pgTable(
	'oauth_refresh_token',
	{
		clientId: text('client_id')
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: 'cascade' }),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		sessionId: text('session_id').references(() => session.id, {
			onDelete: 'set null'
		}),
		createdAt: timestamp('created_at').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		scopes: text('scopes').array().notNull(),
		token: text('token').notNull().unique(),
		referenceId: text('reference_id'),
		authTime: timestamp('auth_time'),
		revoked: timestamp('revoked'),
		id: text('id').primaryKey()
	},
	(table) => [
		index('oauthRefreshToken_clientId_idx').on(table.clientId),
		index('oauthRefreshToken_sessionId_idx').on(table.sessionId),
		index('oauthRefreshToken_userId_idx').on(table.userId)
	]
);

export const oauthAccessToken = pgTable(
	'oauth_access_token',
	{
		clientId: text('client_id')
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: 'cascade' }),
		refreshId: text('refresh_id').references(() => oauthRefreshToken.id, {
			onDelete: 'cascade'
		}),
		sessionId: text('session_id').references(() => session.id, {
			onDelete: 'set null'
		}),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		scopes: text('scopes').array().notNull(),
		token: text('token').notNull().unique(),
		referenceId: text('reference_id'),
		id: text('id').primaryKey()
	},
	(table) => [
		index('oauthAccessToken_clientId_idx').on(table.clientId),
		index('oauthAccessToken_sessionId_idx').on(table.sessionId),
		index('oauthAccessToken_userId_idx').on(table.userId),
		index('oauthAccessToken_refreshId_idx').on(table.refreshId)
	]
);

export const oauthConsent = pgTable(
	'oauth_consent',
	{
		clientId: text('client_id')
			.notNull()
			.references(() => oauthClient.clientId, { onDelete: 'cascade' }),
		userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').notNull(),
		updatedAt: timestamp('updated_at').notNull(),
		scopes: text('scopes').array().notNull(),
		referenceId: text('reference_id'),
		id: text('id').primaryKey()
	},
	(table) => [
		index('oauthConsent_clientId_idx').on(table.clientId),
		index('oauthConsent_userId_idx').on(table.userId)
	]
);
