"use strict";
/**
 * Validation Middleware
 * Validates request body, params, and query against Zod schemas
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValidated = exports.validate = void 0;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
const validators_1 = require("../utils/validators");
/**
 * Validation middleware factory
 * Usage: router.post("/path", validate(bodySchema), controller)
 */
const validate = (schema, source = "body") => {
    return (req, res, next) => {
        try {
            const data = source === "body" ? req.body : source === "params" ? req.params : req.query;
            const validated = schema.parse(data);
            if (!req.validated) {
                req.validated = {};
            }
            req.validated[source] = validated;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const errors = (0, validators_1.formatValidationErrors)(error);
                throw new errors_1.ValidationError(`Validation failed for ${source}`, errors);
            }
            throw error;
        }
    };
};
exports.validate = validate;
/**
 * Get validated data from request
 * Usage in controller: const { body } = (req as ValidatedRequest).validated;
 */
const getValidated = (req, source = "body") => {
    return req.validated?.[source];
};
exports.getValidated = getValidated;
