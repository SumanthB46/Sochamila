import { Router, Request, Response, NextFunction } from "express";
import adminRoutes from "../admin/admin.routes";
import productRoutes from "../modules/products/product.routes";
import authRoutes from "../modules/auth/auth.routes";
import graphicsRoutes from "../modules/graphics/graphics.routes";
import stickerRoutes from "../modules/stickers/sticker.routes";
import categoryRoutes from "../modules/stickers/category.routes";
import vendorRoutes from "../modules/vendor/vendor.routes";
import customerRoutes from "../modules/customer/customer.routes";
import userRoutes from "../modules/users/user.routes";
import orderRoutes from "../modules/orders/order.routes";
import imagekitAuthRoutes from "./imagekit-auth";
import uploadRoutes from "./upload";
import wishlistRoutes from "../modules/wishlist/wishlist.routes";
import aiRoutes from "../modules/ai/ai.routes";
import jerseyRoutes from "../modules/jersey/jersey.routes";

console.log("[ROUTES-INDEX] Starting route initialization...");
console.log("[ROUTES-INDEX] vendorRoutes import successful:", vendorRoutes);

const router = Router();

console.log("[ROUTES-INDEX] Mounting AI routes...");
router.use("/ai", aiRoutes);

console.log("[ROUTES-INDEX] Mounting authentication routes...");
router.use("/auth", authRoutes);

console.log("[ROUTES-INDEX] Mounting admin routes...");
router.use("/admin", adminRoutes);

console.log("[ROUTES-INDEX] Mounting product routes...");
router.use("/products", productRoutes); // PUBLIC PRODUCTS

console.log("[ROUTES-INDEX] Mounting graphics routes...");
router.use("/graphics", graphicsRoutes);

console.log("[ROUTES-INDEX] Mounting AI routes...");
router.use("/ai", aiRoutes);

console.log("[ROUTES-INDEX] Mounting jersey routes...");
router.use("/jersey", jerseyRoutes);

console.log("[ROUTES-INDEX] Mounting sticker routes...");
router.use("/stickers", stickerRoutes);
router.use("/sticker-categories", categoryRoutes);

console.log("[ROUTES-INDEX] Mounting vendor routes...");
router.use("/vendor", vendorRoutes);

// Add a catch-all middleware for vendor requests to see if they're hitting this
router.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.includes("vendor")) {
    console.log("[ROUTES-INDEX] Caught vendor request:", {
      path: req.path,
      method: req.method,
      originalUrl: req.originalUrl,
    });
  }
  next();
});

console.log("[ROUTES-INDEX] Mounting customer routes...");
router.use("/customer", customerRoutes);

console.log("[ROUTES-INDEX] Mounting user routes...");
router.use("/users", userRoutes);

console.log("[ROUTES-INDEX] Mounting order routes...");
router.use("/orders", orderRoutes);

console.log("[ROUTES-INDEX] Mounting ImageKit auth routes...");
router.use("/imagekit-auth", imagekitAuthRoutes);

console.log("[ROUTES-INDEX] Mounting upload routes...");
router.use("/uploads", uploadRoutes);

console.log("[ROUTES-INDEX] Mounting wishlist routes...");
router.use("/wishlist", wishlistRoutes);

// Debug middleware to log all requests
router.use((req: Request, res: Response, next: NextFunction) => {
  console.log("[ROUTES-DEBUG] Incoming request:", {
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    query: req.query,
  });
  next();
});

console.log("[ROUTES-INDEX] All routes mounted successfully!");

export default router;
