"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJerseyImages = generateJerseyImages;
const jersey_generate_service_1 = require("./jersey.generate.service");
/* ======================================================
   JERSEY IMAGE GENERATION CONTROLLER
====================================================== */
/**
 * POST /api/jersey/generate
 * Generate jersey images from design specifications
 * Requires: prompt (design specs as text)
 * Optional: customInstructions (additional AI instructions)
 */
async function generateJerseyImages(req, res, next) {
    try {
        const { prompt, customInstructions } = req.body;
        // Validate prompt
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                error: "Prompt is required",
            });
        }
        if (prompt.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: "Prompt must be at least 10 characters",
            });
        }
        if (prompt.length > 2000) {
            return res.status(400).json({
                success: false,
                error: "Prompt must be less than 2000 characters",
            });
        }
        // Validate custom instructions if provided
        if (customInstructions && typeof customInstructions !== "string") {
            return res.status(400).json({
                success: false,
                error: "Custom instructions must be a string",
            });
        }
        if (customInstructions && customInstructions.length > 500) {
            return res.status(400).json({
                success: false,
                error: "Custom instructions must be less than 500 characters",
            });
        }
        // Generate images
        const result = await (0, jersey_generate_service_1.generateJerseyImages)({
            prompt,
            customInstructions,
        });
        return res.json(result);
    }
    catch (error) {
        console.error("[Jersey Generation Error]", error);
        // Rate limit errors
        if (error?.status === 429 ||
            error?.message?.includes("rate limit")) {
            return res.status(429).json({
                success: false,
                error: "Too many requests. OpenAI rate limit exceeded. Please try again in 1-2 minutes.",
                retryAfter: "60s",
            });
        }
        // Invalid API key
        if (error?.status === 401 || error?.message?.includes("Invalid")) {
            return res.status(401).json({
                success: false,
                error: "Invalid OpenAI API key. Please check your OPENAI_API_KEY in backend .env file.",
                hint: "Get a key at: https://platform.openai.com/api-keys",
            });
        }
        // ImageKit errors
        if (error?.message?.includes("ImageKit")) {
            return res.status(500).json({
                success: false,
                error: "Failed to save generated images. Please try again.",
            });
        }
        // Generic error
        res.status(500).json({
            success: false,
            error: error?.message || "Failed to generate jersey images. Please try again.",
        });
    }
}
