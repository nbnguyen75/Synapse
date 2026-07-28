export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errorCode: string | null;
  details: unknown | null;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokenData {
  token: string;
}
