/**
 * Input Validation Schemas using Zod
 * Centralized validation for all API endpoints
 */

import { z } from "zod";

/* =====================================================
   AUTH SCHEMAS
===================================================== */

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z
    .string()
    .email("Invalid email format")
    .transform(val => val.toLowerCase()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  role: z.enum(["CUSTOMER", "VENDOR"]).default("CUSTOMER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
  password: z.string().min(1, "Password is required"),
});

export const checkEmailSchema = z.object({
  email: z.string().email("Invalid email format").transform(val => val.toLowerCase()),
});

/* =====================================================
   PRODUCT SCHEMAS
===================================================== */

export const createProductSchema = z.object({
  name: z
    .string()
    .min(3, "Product name must be at least 3 characters")
    .max(255, "Product name must be less than 255 characters"),
  description: z.string().optional(),
  gender: z.enum(["MEN", "WOMEN", "KIDS", "UNISEX"]),
  department: z.enum(["CLOTHING", "ACCESSORIES", "FOOTWEAR", "HOME_LIVING", "GEAR"]),
  productType: z.string().min(1, "Product type is required"),
  isActive: z.boolean().default(true),
  isAvailable: z.boolean().default(true),
});

export const updateProductSchema = createProductSchema.partial();

/* =====================================================
   PAGINATION SCHEMA
===================================================== */

export const paginationSchema = z.object({
  page: z
    .number()
    .int()
    .positive("Page must be a positive number")
    .default(1),
  limit: z
    .number()
    .int()
    .positive()
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/* =====================================================
   ORDER SCHEMAS
===================================================== */

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        sizeId: z.string().uuid(),
        quantity: z.number().int().positive("Quantity must be positive"),
        color: z.string().min(1),
      })
    )
    .min(1, "Order must have at least one item"),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    street: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(5),
    country: z.string().min(2),
  }),
});

/* =====================================================
   VALIDATION ERROR FORMATTER
===================================================== */

export const formatValidationErrors = (
  error: z.ZodError<unknown>
): Record<string, string[]> => {
  return error.issues.reduce((acc: Record<string, string[]>, issue: z.ZodIssue) => {
    const path = issue.path.join(".");
    if (!acc[path]) acc[path] = [];
    acc[path].push(issue.message);
    return acc;
  }, {} as Record<string, string[]>);
};

/* =====================================================
   TYPE EXPORTS
===================================================== */

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
