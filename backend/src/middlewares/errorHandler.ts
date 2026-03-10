/**
 * Enhanced Error Handling Middleware
 * Catches and formats all errors consistently
 */

import { Request, Response, NextFunction } from "express";
import { isAppError } from "../utils/errors";
import { errorResponse } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Global Error Handler Middleware
 * Place this LAST in your middleware chain in app.ts
 */
export const globalErrorHandler = (
  err: Error | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate request ID for tracking
  const requestId = req.requestId || `ERR-${Date.now()}`;
  const isDevelopment = process.env.NODE_ENV !== "production";

  console.error(`[${requestId}] Error:`, {
    name: err.name,
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: err.stack }),
  });

  // Handle known AppError instances
  if (isAppError(err)) {
    return res.status(err.statusCode).json(
      errorResponse(err.message, {
        statusCode: err.statusCode,
        errors: err.errors,
        requestId,
      })
    );
  }

  // Handle Zod validation errors (if they reach here)
  if (err.name === "ZodError") {
    const errors = err.flatten();
    return res.status(400).json(
      errorResponse("Validation failed", {
        statusCode: 400,
        errors: errors.fieldErrors as any,
        requestId,
      })
    );
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith("P")) {
    console.error("[Prisma Error]", err.code, err.message);
    const statusCode = err.code === "P2025" ? 404 : 400;
    const message = err.code === "P2025" ? "Resource not found" : "Database error";
    
    return res.status(statusCode).json(
      errorResponse(message, {
        statusCode,
        requestId,
      })
    );
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(
      errorResponse("Invalid or expired token", {
        statusCode: 401,
        requestId,
      })
    );
  }

  // Handle all other errors
  const statusCode = err.statusCode || 500;
  const message = isDevelopment ? err.message : "Internal server error";

  return res.status(statusCode).json(
    errorResponse(message, {
      statusCode,
      requestId,
    })
  );
};

/**
 * 404 Not Found Handler
 * Place this BEFORE error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new Error(
    `Cannot ${req.method} ${req.originalUrl}`
  );
  res.status(404);
  next(error);
};
