"use strict";
/**
 * Request Logging Middleware
 * Logs all incoming requests with response times
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceWarning = exports.httpLogger = exports.requestIdMiddleware = void 0;
const uuid_1 = require("uuid");
/**
 * Request ID Generator Middleware
 * Assigns unique ID to each request for tracking
 */
const requestIdMiddleware = (req, res, next) => {
    const requestId = req.headers["x-request-id"] || (0, uuid_1.v4)();
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    next();
};
exports.requestIdMiddleware = requestIdMiddleware;
/**
 * HTTP Request Logger Middleware
 * Logs incoming requests and response times
 */
const httpLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestId = req.requestId || "unknown";
    // Log incoming request
    console.log(`[${requestId}] → ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get("user-agent")?.substring(0, 50),
    });
    // Capture original res.json
    const originalJson = res.json.bind(res);
    res.json = function (body) {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const isError = statusCode >= 400;
        console.log(`[${requestId}] ← ${req.method} ${req.path} ${statusCode} (+${duration}ms)`, {
            ...(isError && { error: body?.message || "Unknown error" }),
        });
        return originalJson(body);
    };
    next();
};
exports.httpLogger = httpLogger;
/**
 * Performance Warning Middleware
 * Logs requests that take longer than threshold
 */
const performanceWarning = (thresholdMs = 1000) => {
    return (req, res, next) => {
        const startTime = Date.now();
        const requestId = req.requestId || "unknown";
        const originalJson = res.json.bind(res);
        res.json = function (body) {
            const duration = Date.now() - startTime;
            if (duration > thresholdMs) {
                console.warn(`[${requestId}] ⚠️  SLOW REQUEST: ${req.method} ${req.path} took ${duration}ms`);
            }
            return originalJson(body);
        };
        next();
    };
};
exports.performanceWarning = performanceWarning;
