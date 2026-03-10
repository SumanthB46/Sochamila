"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const productRouter = (0, express_1.Router)();
/* ======================================================
   PUBLIC PRODUCT ROUTES
====================================================== */
// GET /api/products
// Returns all active & available products
productRouter.get("/", product_controller_1.getProducts);
// GET /api/products/size/:id
// Returns a single size/variant by ID
productRouter.get("/size/:id", product_controller_1.getSizeById);
// GET /api/products/:id
// Returns a single product by ID
productRouter.get("/:id", product_controller_1.getProductById);
// GET /api/products/related/:id
// Returns related products for a specific product
productRouter.get("/related/:id", product_controller_1.getRelatedProducts);
exports.default = productRouter;
