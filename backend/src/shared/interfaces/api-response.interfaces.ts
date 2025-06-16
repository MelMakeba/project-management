export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  timestamp?: string;
  path?: string;
  code?: number;
  errors?: Record<string, any>;
}

export interface PaginatedApiResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
