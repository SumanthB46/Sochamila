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
exports.deleteProduct = exports.updateProductStatus = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const productService = __importStar(require("./admin.product.service"));
const client_1 = require("@prisma/client");
/* ======================================================
   CREATE PRODUCT
====================================================== */
const createProduct = async (req, res) => {
    try {
        const { name, description, audience, productType, isActive, colors, productImageCount, } = req.body;
        /* ---------- VALIDATION ---------- */
        if (!name || !audience || !productType || !colors) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }
        if (!Object.values(client_1.AudienceCategory).includes(audience)) {
            return res.status(400).json({
                success: false,
                message: "Invalid audience category",
            });
        }
        if (!Object.values(client_1.ProductType).includes(productType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product type",
            });
        }
        /* ---------- PARSE COLORS ---------- */
        let parsedColors = [];
        try {
            parsedColors =
                typeof colors === "string" ? JSON.parse(colors) : colors;
        }
        catch {
            return res.status(400).json({
                success: false,
                message: "Invalid colors format",
            });
        }
        /* ---------- FILE HANDLING ---------- */
        const files = req.files;
        const productFiles = files?.productImages ?? [];
        const colorFiles = files?.colorImages ?? [];
        const totalProductImages = Number(productImageCount) || 0;
        /* ---------- PRODUCT-LEVEL IMAGES ---------- */
        const productImages = totalProductImages > 0
            ? productFiles.slice(0, totalProductImages).map((file, index) => ({
                imageUrl: `/uploads/${file.filename}`,
                sortOrder: index,
                isPrimary: index === 0,
            }))
            : [];
        /* ---------- COLOR-LEVEL IMAGES ---------- */
        let colorFileCursor = 0;
        const colorsWithImages = parsedColors.map((color) => {
            const imageCount = Number(color.imageCount) || 0;
            const images = imageCount > 0
                ? colorFiles
                    .slice(colorFileCursor, colorFileCursor + imageCount)
                    .map((file, index) => ({
                    imageUrl: `/uploads/${file.filename}`,
                    sortOrder: index,
                }))
                : [];
            colorFileCursor += imageCount;
            return {
                name: color.name,
                hexCode: color.hexCode ?? null,
                images,
                sizes: color.sizes ?? [],
            };
        });
        /* ---------- CREATE PRODUCT ---------- */
        const product = await productService.createProduct({
            name: name.trim(),
            description: description?.trim() || null,
            audience,
            productType,
            isActive: isActive !== "false",
            images: productImages,
            colors: colorsWithImages,
        });
        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
exports.createProduct = createProduct;
/* ======================================================
   GET ALL PRODUCTS (ADMIN)
====================================================== */
const getAllProducts = async (_req, res) => {
    try {
        const products = await productService.getAllProducts();
        return res.status(200).json({
            success: true,
            data: products,
        });
    }
    catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
};
exports.getAllProducts = getAllProducts;
/* ======================================================
   GET PRODUCT BY ID
====================================================== */
const getProductById = async (req, res) => {
    try {
        const product = await productService.getProductById(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        return res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("GET PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
};
exports.getProductById = getProductById;
/* ======================================================
   UPDATE PRODUCT
====================================================== */
const updateProduct = async (req, res) => {
    try {
        const product = await productService.updateProduct(req.params.id, req.body);
        return res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
};
exports.updateProduct = updateProduct;
/* ======================================================
   UPDATE ACTIVE STATUS
====================================================== */
const updateProductStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const product = await productService.updateProductStatus(req.params.id, Boolean(isActive));
        return res.status(200).json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        console.error("UPDATE STATUS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update status",
        });
    }
};
exports.updateProductStatus = updateProductStatus;
/* ======================================================
   DELETE PRODUCT
====================================================== */
const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(req.params.id);
        return res.status(200).json({
            success: true,
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete product",
        });
    }
};
exports.deleteProduct = deleteProduct;
