import type { AuthUser } from '@/lib/auth';

export type AuthContext =
  | { isAuthenticated: true; user: AuthUser }
  | { isAuthenticated: false; user: null };

export type ApiResponse<T> =
  | { timestamp: string; success: true; data: T }
  | {
      errorCode: string;
      timestamp: string;
      details: unknown;
      message: string;
      success: false;
    };

export interface ValidationErrorItem {
  message: string;
  field: string;
}

export interface PaginatedData<T> {
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  page: number;
  size: number;
  items: T[];
}

export type PaginatedApiResponse<T> = ApiResponse<PaginatedData<T>>;
