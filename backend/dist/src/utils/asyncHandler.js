"use strict";
/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncMethod = exports.asyncHandler = void 0;
/**
 * Wrapper function that catches async errors
 * Usage: router.get('/path', asyncHandler(controller))
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
/**
 * Alternative: Class decorator for controller methods
 * Usage: asyncMethod(controllerInstance.methodName)
 */
const asyncMethod = (fn) => {
    return function (...args) {
        return Promise.resolve(fn.apply(this, args)).catch(args[2]); // args[2] is next
    };
};
exports.asyncMethod = asyncMethod;
