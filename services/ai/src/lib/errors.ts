import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
	constructor(
		public errorCode: string,
		message: string,
		public status: number = StatusCodes.BAD_REQUEST,
		public details: unknown = null
	) {
		super(message);
		this.name = 'AppError';
	}
}

export class NotFoundError extends AppError {
	constructor(resource: string, id?: string) {
		super(
			'NOT_FOUND',
			`${resource}${id ? ` (${id})` : ''} ghosted us — 404, it's not here.`,
			StatusCodes.NOT_FOUND
		);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Bring your token, we're not letting strangers in.") {
		super('UNAUTHORIZED', message, StatusCodes.UNAUTHORIZED);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Nice try, but this door needs a different key. (403)') {
		super('FORBIDDEN', message, StatusCodes.FORBIDDEN);
	}
}

export class ValidationError extends AppError {
	constructor(details: unknown) {
		super(
			'VALIDATION_ERROR',
			'Your payload and our schema had a disagreement.',
			StatusCodes.BAD_REQUEST,
			details
		);
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super('CONFLICT', message, StatusCodes.CONFLICT);
	}
}
