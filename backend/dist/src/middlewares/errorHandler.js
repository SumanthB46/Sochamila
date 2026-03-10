"use strict";
/**
 * Enhanced Error Handling Middleware
 * Catches and formats all errors consistently
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.globalErrorHandler = void 0;
const errors_1 = require("../utils/errors");
const response_1 = require("../utils/response");
/**
 * Global Error Handler Middleware
 * Place this LAST in your middleware chain in app.ts
 */
const globalErrorHandler = (err, req, res, next) => {
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
    if ((0, errors_1.isAppError)(err)) {
        return res.status(err.statusCode).json((0, response_1.errorResponse)(err.message, {
            statusCode: err.statusCode,
            errors: err.errors,
            requestId,
        }));
    }
    // Handle Zod validation errors (if they reach here)
    if (err.name === "ZodError") {
        const errors = err.flatten();
        return res.status(400).json((0, response_1.errorResponse)("Validation failed", {
            statusCode: 400,
            errors: errors.fieldErrors,
            requestId,
        }));
    }
    // Handle Prisma errors
    if (err.code && err.code.startsWith("P")) {
        console.error("[Prisma Error]", err.code, err.message);
        const statusCode = err.code === "P2025" ? 404 : 400;
        const message = err.code === "P2025" ? "Resource not found" : "Database error";
        return res.status(statusCode).json((0, response_1.errorResponse)(message, {
            statusCode,
            requestId,
        }));
    }
    // Handle JWT errors
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json((0, response_1.errorResponse)("Invalid or expired token", {
            statusCode: 401,
            requestId,
        }));
    }
    // Handle all other errors
    const statusCode = err.statusCode || 500;
    const message = isDevelopment ? err.message : "Internal server error";
    return res.status(statusCode).json((0, response_1.errorResponse)(message, {
        statusCode,
        requestId,
    }));
};
exports.globalErrorHandler = globalErrorHandler;
/**
 * 404 Not Found Handler
 * Place this BEFORE error handler
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Cannot ${req.method} ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
