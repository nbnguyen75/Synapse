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
		super('NOT_FOUND', `${resource}${id ? ` (${id})` : ''} not found`, StatusCodes.NOT_FOUND);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Unauthorized') {
		super('UNAUTHORIZED', message, StatusCodes.UNAUTHORIZED);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'Forbidden') {
		super('FORBIDDEN', message, StatusCodes.FORBIDDEN);
	}
}

export class ValidationError extends AppError {
	constructor(details: unknown) {
		super('VALIDATION_ERROR', 'Invalid request', StatusCodes.BAD_REQUEST, details);
	}
}
