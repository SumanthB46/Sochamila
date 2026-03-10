/**
 * Centralized Response Handler
 * Ensures consistent API responses across all endpoints
 */

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
  requestId?: string;
}

/**
 * Format success response
 */
export const successResponse = <T>(
  message: string,
  data?: T,
  options?: {
    statusCode?: number;
    pagination?: ApiResponse["pagination"];
    requestId?: string;
  }
): ApiResponse<T> => {
  return {
    success: true,
    statusCode: options?.statusCode ?? 200,
    message,
    data,
    pagination: options?.pagination,
    timestamp: new Date().toISOString(),
    requestId: options?.requestId,
  };
};

/**
 * Format error response
 */
export const errorResponse = (
  message: string,
  options?: {
    statusCode?: number;
    errors?: Record<string, string[]>;
    requestId?: string;
  }
): ApiResponse => {
  return {
    success: false,
    statusCode: options?.statusCode ?? 500,
    message,
    errors: options?.errors,
    timestamp: new Date().toISOString(),
    requestId: options?.requestId,
  };
};

/**
 * Send success response in controller
 */
export const sendSuccess = (res: any, message: string, data?: any, statusCode = 200) => {
  return res.status(statusCode).json(successResponse(message, data, { statusCode }));
};

/**
 * Send error response in controller
 */
export const sendError = (res: any, message: string, statusCode = 500, errors?: any) => {
  return res.status(statusCode).json(errorResponse(message, { statusCode, errors }));
};
