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
exports.getProductById = exports.getProducts = void 0;
const productService = __importStar(require("./product.service"));
/* ======================================================
   GET ALL SHOP PRODUCTS
====================================================== */
const getProducts = async (_req, res) => {
    try {
        const products = await productService.getAllPublicProducts();
        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            data: products,
        });
    }
    catch (error) {
        console.error("PUBLIC PRODUCTS ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            data: null,
        });
    }
};
exports.getProducts = getProducts;
/* ======================================================
   GET SINGLE PRODUCT BY ID
====================================================== */
const getProductById = async (req, res) => {
    try {
        const id = req.params.id?.trim();
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Product ID is required",
                data: null,
            });
        }
        const product = await productService.getPublicProductById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                data: null,
            });
        }
        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            data: product,
        });
    }
    catch (error) {
        console.error("PUBLIC PRODUCT ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch product",
            data: null,
        });
    }
};
exports.getProductById = getProductById;
