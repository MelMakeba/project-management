import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  PaginatedApiResponse,
} from './interfaces/api-response.interfaces';

@Injectable()
export class ApiResponseService {
  /**
   * Create a success response
   */
  success<T>(
    data: T,
    token: string,
    message = 'Operation successful',
  ): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      token,
      timestamp: new Date().toISOString(),
    };
  }
  /**
   * Create an error response
   */
  error<T = null>(
    message: string,
    token = '', // Add default parameter
    data: T | null = null,
    errors?: Record<string, any>,
  ): ApiResponse<T | null> {
    return {
      success: false,
      token,
      message,
      data,
      timestamp: new Date().toISOString(),
      errors,
    };
  }
  /**
   * Create a paginated response
   */
  paginated<T>(
    data: T[],
    token: string,
    page: number,
    limit: number,
    total: number,
    message = 'Data retrieved successfully',
  ): PaginatedApiResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message,
      data,
      token,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        totalItems: total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
