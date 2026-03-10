import { Router } from "express";

import authRoutes from "./modules/auth/auth.routes";
import productRoutes from "./modules/products/product.routes";
import adminRoutes from "./admin/admin.routes";
import uploadRoutes from "./routes/upload";
import aiRoutes from "./modules/ai/ai.routes";
import imageToolsRoutes from "./routes/image-tools";

const router = Router();

/* ================= API ROUTES ================= */

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

router.use("/upload", uploadRoutes);
router.use("/image", imageToolsRoutes);

router.use("/ai", aiRoutes);
router.use("/admin", adminRoutes);

export default router;
