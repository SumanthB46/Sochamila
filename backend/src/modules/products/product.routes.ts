import { Router } from "express";
import {
  getProducts,
  getProductById,
  getSizeById,
  getRelatedProducts,
} from "./product.controller";

const productRouter = Router();

/* ======================================================
   PUBLIC PRODUCT ROUTES
====================================================== */

// GET /api/products
// Returns all active & available products
productRouter.get("/", getProducts);

// GET /api/products/size/:id
// Returns a single size/variant by ID
productRouter.get("/size/:id", getSizeById);

// GET /api/products/:id
// Returns a single product by ID
productRouter.get("/:id", getProductById);

// GET /api/products/related/:id
// Returns related products for a specific product
productRouter.get("/related/:id", getRelatedProducts);

export default productRouter;
