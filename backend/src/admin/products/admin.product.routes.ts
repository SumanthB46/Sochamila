import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  updateProductStatus,
  deleteProduct,
} from "./admin.product.controller";

const router = Router();

/* ======================================================
   MULTER CONFIG
====================================================== */

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
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
router.post(
  "/",
  upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "colorImages", maxCount: 50 },
  ]),
  createProduct
);

/**
 * GET ALL PRODUCTS (ADMIN)
 */
router.get("/", getAllProducts);

/**
 * GET PRODUCT BY ID
 */
router.get("/:id", getProductById);

/**
 * UPDATE PRODUCT (basic info + images)
 */
router.put(
  "/:id",
  upload.fields([
    { name: "productImages", maxCount: 10 },
    { name: "colorImages", maxCount: 50 },
  ]),
  updateProduct
);

/**
 * UPDATE ACTIVE STATUS
 */
router.patch("/:id/status", updateProductStatus);

/**
 * DELETE PRODUCT
 * ⚠️ NO MULTER HERE
 */
router.delete("/:id", deleteProduct);

export default router;
