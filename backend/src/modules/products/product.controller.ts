import { Request, Response } from "express";
import * as productService from "./product.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess, sendError } from "../../utils/response";

/* ======================================================
   GET ALL SHOP PRODUCTS
====================================================== */

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  // Pagination (query params: page, limit) - default values
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  try {
    const result = await productService.getAllPublicProducts(page, limit);

    // Return array in `data` for compatibility with frontend
    return sendSuccess(res, "Products fetched successfully", result.items);
  } catch (error: any) {
    console.error("PUBLIC PRODUCTS ERROR:", error);

    if (error.message && error.message.includes("Can't reach database")) {
      return sendError(res, "Database unavailable", 503);
    }

    return sendError(res, "Failed to fetch products", 500);
  }
});

/* ======================================================
   GET SINGLE PRODUCT BY ID
====================================================== */

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

  if (!id) {
    return sendError(res, "Product ID is required", 400);
  }

  try {
    const product = await productService.getPublicProductById(id);

    if (!product) {
      return sendError(res, "Product not found", 404);
    }

    return sendSuccess(res, "Product fetched successfully", product);
  } catch (error: any) {
    console.error("PUBLIC PRODUCT ERROR:", error);
    if (error.message && error.message.includes("Can't reach database")) {
      return sendError(res, "Database unavailable", 503);
    }
    return sendError(res, "Failed to fetch product", 500);
  }
});

/* ======================================================
   GET SIZE BY ID (for checkout page)
====================================================== */

export const getSizeById = asyncHandler(async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';

  if (!id) {
    return sendError(res, "Size ID is required", 400);
  }

  try {
    const size = await productService.getSizeById(id);

    if (!size) {
      return sendError(res, "Size not found", 404);
    }

    return sendSuccess(res, "Size fetched successfully", size);
  } catch (error: any) {
    console.error("GET SIZE ERROR:", error);
    if (error.message && error.message.includes("Can't reach database")) {
      return sendError(res, "Database unavailable", 503);
    }
    return sendError(res, "Failed to fetch size", 500);
  }
});

/* ======================================================
   GET RELATED PRODUCTS
====================================================== */

export const getRelatedProducts = asyncHandler(async (req: Request, res: Response) => {
  const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
  
  if (!id) {
    return sendError(res, "Product ID is required", 400);
  }
  
  try {
    // First get the product to get its department
    const product = await productService.getPublicProductById(id);
    
    if (!product) {
      return sendError(res, "Product not found", 404);
    }
    
    // Get limit from query params, default to 4
    const limit = Number(req.query.limit) || 4;
    
    const relatedProducts = await productService.getRelatedProducts(id, product.department, limit);
    
    return sendSuccess(res, "Related products fetched successfully", {
      relatedProducts,
      count: relatedProducts.length
    });
  } catch (error: any) {
    console.error("RELATED PRODUCTS ERROR:", error);
    if (error.message && error.message.includes("Can't reach database")) {
      return sendError(res, "Database unavailable", 503);
    }
    return sendError(res, "Failed to fetch related products", 500);
  }
});
