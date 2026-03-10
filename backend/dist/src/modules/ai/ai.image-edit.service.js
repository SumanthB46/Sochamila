"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeBackground = removeBackground;
exports.upscaleImage = upscaleImage;
exports.editImage = editImage;
const replicate_1 = __importDefault(require("replicate"));
const imagekit_1 = require("../../lib/imagekit");
/* ======================================================
   IMAGE EDIT (Remove background, Upscale)
   Uses Replicate + uploads result to ImageKit for permanent URL
====================================================== */
const REPLICATE_REMBG = "cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003";
const REPLICATE_UPSCALE = "nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b";
async function downloadImageAsBase64(imageUrl) {
    const res = await fetch(imageUrl);
    if (!res.ok)
        throw new Error(`Failed to fetch image: ${res.status}`);
    const buf = await res.arrayBuffer();
    return Buffer.from(buf).toString("base64");
}
async function uploadToImageKit(base64, prefix) {
    const result = await imagekit_1.imagekit.upload({
        file: base64,
        fileName: `${prefix}-${Date.now()}.png`,
        folder: "/ai-generated",
        tags: ["ai-edit", prefix],
    });
    return result.url;
}
function getReplicateToken() {
    const token = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY;
    if (!token || !token.trim()) {
        throw new Error("REPLICATE_API_TOKEN (or REPLICATE_API_KEY) is not set in .env. Get one at https://replicate.com/account/api-tokens");
    }
    return token.trim();
}
/**
 * Remove background from image using Replicate rembg
 */
async function removeBackground(imageUrl) {
    const token = getReplicateToken();
    const replicate = new replicate_1.default({ auth: token });
    const raw = await replicate.run(REPLICATE_REMBG, {
        input: { image: imageUrl },
    });
    const outputUrl = typeof raw === "string" ? raw : raw?.url?.() ?? raw?.url;
    if (!outputUrl || typeof outputUrl !== "string") {
        throw new Error("No output from remove background");
    }
    const base64 = await downloadImageAsBase64(outputUrl);
    const url = await uploadToImageKit(base64, "nobg");
    return { success: true, url, action: "remove-bg" };
}
/**
 * Upscale image using Replicate Real-ESRGAN
 */
async function upscaleImage(imageUrl, scale = 2) {
    const token = getReplicateToken();
    const replicate = new replicate_1.default({ auth: token });
    const raw = await replicate.run(REPLICATE_UPSCALE, {
        input: {
            image: imageUrl,
            scale: Math.min(4, Math.max(2, scale)),
            face_enhance: false,
        },
    });
    const outputUrl = typeof raw === "string" ? raw : raw?.url?.() ?? raw?.url;
    if (!outputUrl || typeof outputUrl !== "string") {
        throw new Error("No output from upscale");
    }
    const base64 = await downloadImageAsBase64(outputUrl);
    const url = await uploadToImageKit(base64, "upscaled");
    return { success: true, url, action: "upscale" };
}
async function editImage(imageUrl, action) {
    if (action === "remove-bg")
        return removeBackground(imageUrl);
    if (action === "upscale")
        return upscaleImage(imageUrl);
    throw new Error(`Unknown action: ${action}`);
}
