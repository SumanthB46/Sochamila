"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImage = generateImage;
exports.generateImageSDXL = generateImageSDXL;
const openai_1 = __importDefault(require("openai"));
const imagekit_1 = require("../../lib/imagekit");
/* ================= GENERATE IMAGE ================= */
/**
 * Generate an image using OpenAI DALL-E 3
 * and upload to ImageKit for permanent storage
 */
async function generateImage(options) {
    const { prompt } = options;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured. Get a key at https://platform.openai.com/api-keys and add it to your .env file.");
    }
    const openai = new openai_1.default({ apiKey });
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: prompt.trim(),
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "b64_json",
        });
        const imageData = response.data?.[0]?.b64_json;
        if (!imageData) {
            throw new Error("No image data in OpenAI response. Try a different prompt.");
        }
        const uploadResponse = await imagekit_1.imagekit.upload({
            file: imageData,
            fileName: `ai-dalle-${Date.now()}.png`,
            folder: "/ai-generated",
            tags: ["ai-generated", "dall-e-3"],
        });
        return {
            success: true,
            url: uploadResponse.url,
            prompt,
            model: "dall-e-3",
        };
    }
    catch (err) {
        // Re-throw with clearer error message for rate limits
        if (err?.status === 429 || err?.code === "rate_limit_exceeded") {
            const rateError = new Error(`OpenAI rate limit exceeded: ${err?.message || "Please try again later."}`);
            rateError.status = 429;
            rateError.error = err;
            throw rateError;
        }
        // Invalid API key
        if (err?.status === 401 || err?.message?.includes("Incorrect API key")) {
            const authError = new Error("Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.");
            authError.status = 401;
            throw authError;
        }
        throw err;
    }
}
/**
 * Pro model (DALL-E 3 HD) — higher quality
 */
async function generateImageSDXL(options) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("OPENAI_API_KEY is not configured. Get a key at https://platform.openai.com/api-keys and add it to your .env file.");
    }
    const openai = new openai_1.default({ apiKey });
    try {
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: options.prompt.trim(),
            n: 1,
            size: "1024x1024",
            quality: "hd",
            response_format: "b64_json",
        });
        const imageData = response.data?.[0]?.b64_json;
        if (!imageData) {
            throw new Error("No image data in OpenAI response. Try a different prompt.");
        }
        const uploadResponse = await imagekit_1.imagekit.upload({
            file: imageData,
            fileName: `ai-dalle-hd-${Date.now()}.png`,
            folder: "/ai-generated",
            tags: ["ai-generated", "dall-e-3-hd"],
        });
        return {
            success: true,
            url: uploadResponse.url,
            prompt: options.prompt,
            model: "dall-e-3-hd",
        };
    }
    catch (err) {
        if (err?.status === 429 || err?.code === "rate_limit_exceeded") {
            const rateError = new Error(`OpenAI rate limit exceeded: ${err?.message || "Please try again later."}`);
            rateError.status = 429;
            throw rateError;
        }
        if (err?.status === 401 || err?.message?.includes("Incorrect API key")) {
            const authError = new Error("Invalid OpenAI API key. Check OPENAI_API_KEY in your .env file.");
            authError.status = 401;
            throw authError;
        }
        throw err;
    }
}
