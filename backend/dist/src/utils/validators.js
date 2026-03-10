"use strict";
/**
 * Input Validation Schemas using Zod
 * Centralized validation for all API endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatValidationErrors = exports.createOrderSchema = exports.paginationSchema = exports.updateProductSchema = exports.createProductSchema = exports.checkEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
/* =====================================================
   AUTH SCHEMAS
===================================================== */
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    email: zod_1.z
        .string()
        .email("Invalid email format")
        .transform(val => val.toLowerCase()),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
    role: zod_1.z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").transform(val => val.toLowerCase()),
    password: zod_1.z.string().min(1, "Password is required"),
});
exports.checkEmailSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").transform(val => val.toLowerCase()),
});
/* =====================================================
   PRODUCT SCHEMAS
===================================================== */
exports.createProductSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(3, "Product name must be at least 3 characters")
        .max(255, "Product name must be less than 255 characters"),
    description: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
    department: zod_1.z.enum(["CLOTHING", "ACCESSORIES", "FOOTWEAR", "HOME_LIVING", "GEAR"]),
    productType: zod_1.z.string().min(1, "Product type is required"),
    isActive: zod_1.z.boolean().default(true),
    isAvailable: zod_1.z.boolean().default(true),
});
exports.updateProductSchema = exports.createProductSchema.partial();
/* =====================================================
   PAGINATION SCHEMA
===================================================== */
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z
        .number()
        .int()
        .positive("Page must be a positive number")
        .default(1),
    limit: zod_1.z
        .number()
        .int()
        .positive()
        .max(100, "Limit cannot exceed 100")
        .default(10),
});
/* =====================================================
   ORDER SCHEMAS
===================================================== */
exports.createOrderSchema = zod_1.z.object({
    items: zod_1.z
        .array(zod_1.z.object({
        productId: zod_1.z.string().uuid(),
        sizeId: zod_1.z.string().uuid(),
        quantity: zod_1.z.number().int().positive("Quantity must be positive"),
        color: zod_1.z.string().min(1),
    }))
        .min(1, "Order must have at least one item"),
    shippingAddress: zod_1.z.object({
        fullName: zod_1.z.string().min(2),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().min(10),
        street: zod_1.z.string().min(5),
        city: zod_1.z.string().min(2),
        state: zod_1.z.string().min(2),
        postalCode: zod_1.z.string().min(5),
        country: zod_1.z.string().min(2),
    }),
});
/* =====================================================
   VALIDATION ERROR FORMATTER
===================================================== */
const formatValidationErrors = (error) => {
    return error.issues.reduce((acc, issue) => {
        const path = issue.path.join(".");
        if (!acc[path])
            acc[path] = [];
        acc[path].push(issue.message);
        return acc;
    }, {});
};
exports.formatValidationErrors = formatValidationErrors;
