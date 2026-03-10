import { Router } from "express";
import { generateJerseyImages } from "./jersey.generate.controller";

const router = Router();

/* ======================================================
   JERSEY ROUTES
====================================================== */

/**
 * POST /api/jersey/generate
 * Generate jersey images from design specifications
 * Public endpoint (no auth required for MVP, can add later)
 */
router.post("/generate", generateJerseyImages);

export default router;
