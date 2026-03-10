"use strict";
/**
 * Centralized Response Handler
 * Ensures consistent API responses across all endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.errorResponse = exports.successResponse = void 0;
/**
 * Format success response
 */
const successResponse = (message, data, options) => {
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
exports.successResponse = successResponse;
/**
 * Format error response
 */
const errorResponse = (message, options) => {
    return {
        success: false,
        statusCode: options?.statusCode ?? 500,
        message,
        errors: options?.errors,
        timestamp: new Date().toISOString(),
        requestId: options?.requestId,
    };
};
exports.errorResponse = errorResponse;
/**
 * Send success response in controller
 */
const sendSuccess = (res, message, data, statusCode = 200) => {
    return res.status(statusCode).json((0, exports.successResponse)(message, data, { statusCode }));
};
exports.sendSuccess = sendSuccess;
/**
 * Send error response in controller
 */
const sendError = (res, message, statusCode = 500, errors) => {
    return res.status(statusCode).json((0, exports.errorResponse)(message, { statusCode, errors }));
};
exports.sendError = sendError;
