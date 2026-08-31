export type ApiSuccessResponse<T> = {
  timestamp: string;
  success: true;
  data: T;
};

export type ApiErrorResponse = {
  errorCode: string;
  timestamp: string;
  details: unknown;
  message: string;
  success: false;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedData<T> {
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  page: number;
  size: number;
  items: T[];
}

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;

export type PaginatedApiSuccessResponse<T> = ApiSuccessResponse<PaginatedData<T>>;
