"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedProducts = exports.getSizeById = exports.getProductById = exports.getProducts = void 0;
const productService = __importStar(require("./product.service"));
const asyncHandler_1 = require("../../utils/asyncHandler");
const response_1 = require("../../utils/response");
/* ======================================================
   GET ALL SHOP PRODUCTS
====================================================== */
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Pagination (query params: page, limit) - default values
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    try {
        const result = await productService.getAllPublicProducts(page, limit);
        // Return array in `data` for compatibility with frontend
        return (0, response_1.sendSuccess)(res, "Products fetched successfully", result.items);
    }
    catch (error) {
        console.error("PUBLIC PRODUCTS ERROR:", error);
        if (error.message && error.message.includes("Can't reach database")) {
            return (0, response_1.sendError)(res, "Database unavailable", 503);
        }
        return (0, response_1.sendError)(res, "Failed to fetch products", 500);
    }
});
/* ======================================================
   GET SINGLE PRODUCT BY ID
====================================================== */
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
        return (0, response_1.sendError)(res, "Product ID is required", 400);
    }
    try {
        const product = await productService.getPublicProductById(id);
        if (!product) {
            return (0, response_1.sendError)(res, "Product not found", 404);
        }
        return (0, response_1.sendSuccess)(res, "Product fetched successfully", product);
    }
    catch (error) {
        console.error("PUBLIC PRODUCT ERROR:", error);
        if (error.message && error.message.includes("Can't reach database")) {
            return (0, response_1.sendError)(res, "Database unavailable", 503);
        }
        return (0, response_1.sendError)(res, "Failed to fetch product", 500);
    }
});
/* ======================================================
   GET SIZE BY ID (for checkout page)
====================================================== */
exports.getSizeById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
        return (0, response_1.sendError)(res, "Size ID is required", 400);
    }
    try {
        const size = await productService.getSizeById(id);
        if (!size) {
            return (0, response_1.sendError)(res, "Size not found", 404);
        }
        return (0, response_1.sendSuccess)(res, "Size fetched successfully", size);
    }
    catch (error) {
        console.error("GET SIZE ERROR:", error);
        if (error.message && error.message.includes("Can't reach database")) {
            return (0, response_1.sendError)(res, "Database unavailable", 503);
        }
        return (0, response_1.sendError)(res, "Failed to fetch size", 500);
    }
});
/* ======================================================
   GET RELATED PRODUCTS
====================================================== */
exports.getRelatedProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = typeof req.params.id === 'string' ? req.params.id.trim() : '';
    if (!id) {
        return (0, response_1.sendError)(res, "Product ID is required", 400);
    }
    try {
        // First get the product to get its department
        const product = await productService.getPublicProductById(id);
        if (!product) {
            return (0, response_1.sendError)(res, "Product not found", 404);
        }
        // Get limit from query params, default to 4
        const limit = Number(req.query.limit) || 4;
        const relatedProducts = await productService.getRelatedProducts(id, product.department, limit);
        return (0, response_1.sendSuccess)(res, "Related products fetched successfully", {
            relatedProducts,
            count: relatedProducts.length
        });
    }
    catch (error) {
        console.error("RELATED PRODUCTS ERROR:", error);
        if (error.message && error.message.includes("Can't reach database")) {
            return (0, response_1.sendError)(res, "Database unavailable", 503);
        }
        return (0, response_1.sendError)(res, "Failed to fetch related products", 500);
    }
});
