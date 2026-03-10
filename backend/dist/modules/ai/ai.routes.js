"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("./ai.controller");
const ai_generate_controller_1 = require("./ai.generate.controller");
const router = (0, express_1.Router)();
/* ======================================================
   AI ROUTES
====================================================== */
// Image transformation (existing)
router.post("/transform", ai_controller_1.transformImage);
// AI Image Generation
// TODO: Re-enable authMiddleware for production
// router.post("/generate", authMiddleware, generateAIImage);
router.post("/generate", ai_generate_controller_1.generateAIImage); // Temporarily without auth for testing
exports.default = router;
