import { Injectable } from '@nestjs/common';
import { ApiResponse } from './interfaces/api-response.interfaces';

@Injectable()
export class ApiResponseService {
  /**
   * Create a success response
   */
  success<T>(data: T, message = 'Operation successful'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      code: 200,
    };
  }

  /**
   * Create an error response
   */
  error<T = null>(message: string, data?: T, code = 400): ApiResponse<T> {
    return {
      success: false,
      message,
      data,
      error: message,
      timestamp: new Date().toISOString(),
      code,
    };
  }

  /**
   * Create a response with metadata
   */
  withMetadata<T>(
    response: ApiResponse<T>,
    metadata: Record<string, any>,
  ): ApiResponse<T> {
    return {
      ...response,
      metadata,
    };
  }
}
