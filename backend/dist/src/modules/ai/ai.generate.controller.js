"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIImage = generateAIImage;
const ai_generate_service_1 = require("./ai.generate.service");
/* ======================================================
   AI IMAGE GENERATION CONTROLLER
====================================================== */
/**
 * POST /api/ai/generate
 * Generate an AI image from a text prompt
 */
async function generateAIImage(req, res, next) {
    try {
        const { prompt, model } = req.body;
        // Validate prompt
        if (!prompt || typeof prompt !== "string") {
            return res.status(400).json({
                success: false,
                error: "Prompt is required",
            });
        }
        if (prompt.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: "Prompt must be at least 3 characters",
            });
        }
        if (prompt.length > 1000) {
            return res.status(400).json({
                success: false,
                error: "Prompt must be less than 1000 characters",
            });
        }
        // Generate image based on model selection
        const result = model === "sdxl"
            ? await (0, ai_generate_service_1.generateImageSDXL)({ prompt })
            : await (0, ai_generate_service_1.generateImage)({ prompt });
        res.json(result);
    }
    catch (error) {
        console.error("[AI Generation Error]", error);
        // Handle OpenAI rate limit errors
        if (error?.status === 429 || error?.message?.includes("rate limit") || error?.code === "rate_limit_exceeded") {
            return res.status(429).json({
                success: false,
                error: "OpenAI rate limit exceeded. Please try again later.",
                retryAfter: "60s",
            });
        }
        // Handle API key errors
        if (error?.message?.includes("API key") || error?.message?.includes("Invalid") || error?.message?.includes("Incorrect API key") || error?.status === 401) {
            return res.status(401).json({
                success: false,
                error: "Invalid API key. Please check your OPENAI_API_KEY in .env",
            });
        }
        // Handle other errors
        res.status(500).json({
            success: false,
            error: error?.message || "Failed to generate image. Please try again.",
        });
    }
}
