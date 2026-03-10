"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageSDXL = void 0;
exports.generateImage = generateImage;
exports.generateImageFast = generateImageFast;
const imagekit_1 = require("../../lib/imagekit");
/* ======================================================
   HUGGING FACE AI IMAGE GENERATION SERVICE
====================================================== */
const HF_API_URL = "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0";
/* ================= GENERATE IMAGE ================= */
/**
 * Generate an image using Hugging Face Stable Diffusion XL (free)
 * and upload to ImageKit for permanent storage
 */
async function generateImage(options) {
    const { prompt, negativePrompt = "blurry, bad quality, distorted" } = options;
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    console.log(`[AI] Token check: ${apiToken ? 'Token exists (' + apiToken.slice(0, 10) + '...)' : 'NO TOKEN'}`);
    if (!apiToken) {
        throw new Error("HUGGINGFACE_API_TOKEN is not configured. Please add it to your .env file.");
    }
    console.log(`[AI] Generating image for prompt: "${prompt.slice(0, 50)}..."`);
    // 1. Call Hugging Face Inference API
    const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: prompt,
            parameters: {
                negative_prompt: negativePrompt,
                num_inference_steps: 30,
                guidance_scale: 7.5,
            },
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI] Hugging Face API error:`, errorText);
        // Handle model loading (503 error)
        if (response.status === 503) {
            const errorJson = JSON.parse(errorText);
            if (errorJson.error?.includes("loading")) {
                throw new Error("Model is loading. Please try again in ~20 seconds.");
            }
        }
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }
    // 2. Get image blob from response
    const imageBlob = await response.blob();
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = imageBuffer.toString("base64");
    console.log(`[AI] Image generated, uploading to ImageKit...`);
    // 3. Upload to ImageKit for permanent storage
    const uploadResponse = await imagekit_1.imagekit.upload({
        file: base64Image,
        fileName: `ai-${Date.now()}.png`,
        folder: "/ai-generated",
        tags: ["ai-generated", "stable-diffusion-xl"],
    });
    console.log(`[AI] Upload complete: ${uploadResponse.url}`);
    return {
        success: true,
        url: uploadResponse.url,
        prompt,
        model: "stable-diffusion-xl",
    };
}
/* ================= ALTERNATIVE: FASTER MODEL ================= */
const HF_FAST_API_URL = "https://router.huggingface.co/hf-inference/models/runwayml/stable-diffusion-v1-5";
/**
 * Generate with Stable Diffusion 1.5 (faster, lower quality)
 */
async function generateImageFast(options) {
    const { prompt } = options;
    const apiToken = process.env.HUGGINGFACE_API_TOKEN;
    if (!apiToken) {
        throw new Error("HUGGINGFACE_API_TOKEN is not configured");
    }
    const response = await fetch(HF_FAST_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            inputs: prompt,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status}`);
    }
    const imageBlob = await response.blob();
    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = imageBuffer.toString("base64");
    const uploadResponse = await imagekit_1.imagekit.upload({
        file: base64Image,
        fileName: `ai-fast-${Date.now()}.png`,
        folder: "/ai-generated",
        tags: ["ai-generated", "sd-1.5"],
    });
    return {
        success: true,
        url: uploadResponse.url,
        prompt,
        model: "stable-diffusion-1.5",
    };
}
// Keep for backwards compatibility
exports.generateImageSDXL = generateImage;
