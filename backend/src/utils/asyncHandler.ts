/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */

import { Request, Response, NextFunction } from "express";

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

/**
 * Wrapper function that catches async errors
 * Usage: router.get('/path', asyncHandler(controller))
 */
export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative: Class decorator for controller methods
 * Usage: asyncMethod(controllerInstance.methodName)
 */
export const asyncMethod = (fn: Function) => {
  return function (this: any, ...args: any[]) {
    return Promise.resolve(fn.apply(this, args)).catch(args[2]); // args[2] is next
  };
};
