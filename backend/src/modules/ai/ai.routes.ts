import { Router } from "express";
import { transformImage } from "./ai.controller";
import { generateAIImage } from "./ai.generate.controller";
import { imageEdit } from "./ai.image-edit.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

/* ======================================================
   AI ROUTES
====================================================== */

// Image transformation (existing)
router.post("/transform", transformImage);

// AI Image Generation (SECURED ✅)
router.post("/generate", authMiddleware, generateAIImage);

// Edit image (remove bg, upscale) — updates layer when applied
router.post("/image-edit", authMiddleware, imageEdit);

export default router;
