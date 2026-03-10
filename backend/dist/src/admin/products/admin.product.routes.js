"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const admin_product_controller_1 = require("./admin.product.controller");
const router = (0, express_1.Router)();
/* ======================================================
   MULTER CONFIG
====================================================== */
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            cb(new Error("Only image files are allowed"));
            return;
        }
        cb(null, true);
    },
});
/* ======================================================
   ROUTES
====================================================== */
/**
 * CREATE PRODUCT
 * Multipart fields expected:
 * - productImages[] (gallery images)
 * - colorImages[]   (optional, color-wise images)
 */
router.post("/", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "colorImages", maxCount: 50 },
]), admin_product_controller_1.createProduct);
/**
 * GET ALL PRODUCTS (ADMIN)
 */
router.get("/", admin_product_controller_1.getAllProducts);
/**
 * GET PRODUCT BY ID
 */
router.get("/:id", admin_product_controller_1.getProductById);
/**
 * UPDATE PRODUCT (basic info + images)
 */
router.put("/:id", upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "colorImages", maxCount: 50 },
]), admin_product_controller_1.updateProduct);
/**
 * UPDATE ACTIVE STATUS
 */
router.patch("/:id/status", admin_product_controller_1.updateProductStatus);
/**
 * DELETE PRODUCT
 * ⚠️ NO MULTER HERE
 */
router.delete("/:id", admin_product_controller_1.deleteProduct);
exports.default = router;
