"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jersey_generate_controller_1 = require("./jersey.generate.controller");
const router = (0, express_1.Router)();
/* ======================================================
   JERSEY ROUTES
====================================================== */
/**
 * POST /api/jersey/generate
 * Generate jersey images from design specifications
 * Public endpoint (no auth required for MVP, can add later)
 */
router.post("/generate", jersey_generate_controller_1.generateJerseyImages);
exports.default = router;
