import { pgTable, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

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
