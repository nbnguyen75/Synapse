export type ApiResponse<T> =
	| {
			errorCode: string;
			timestamp: string;
			details: unknown;
			message: string;
			success: false;
	  }
	| { timestamp: string; success: true; data: T };
