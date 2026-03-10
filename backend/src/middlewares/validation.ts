/**
 * Validation Middleware
 * Validates request body, params, and query against Zod schemas
 */

import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ValidationError } from "../utils/errors";
import { formatValidationErrors } from "../utils/validators";

export type ValidatedRequest<T = any> = Request & {
  validated: {
    body?: T;
    params?: any;
    query?: any;
  };
};

/**
 * Validation middleware factory
 * Usage: router.post("/path", validate(bodySchema), controller)
 */
export const validate = (
  schema: ZodSchema,
  source: "body" | "params" | "query" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = source === "body" ? req.body : source === "params" ? req.params : req.query;
      const validated = schema.parse(data);

      if (!(req as any).validated) {
        (req as any).validated = {};
      }
      (req as any).validated[source] = validated;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = formatValidationErrors(error);
        throw new ValidationError(`Validation failed for ${source}`, errors);
      }
      throw error;
    }
  };
};

/**
 * Get validated data from request
 * Usage in controller: const { body } = (req as ValidatedRequest).validated;
 */
export const getValidated = (req: ValidatedRequest, source: "body" | "params" | "query" = "body") => {
  return (req as any).validated?.[source];
};
