"use strict";
/* ======================================================
   IMAGEKIT AI TRANSFORM SERVICE
====================================================== */
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartCrop = smartCrop;
exports.removeBackground = removeBackground;
exports.upscale = upscale;
exports.enhance = enhance;
exports.enhanceAndUpscale = enhanceAndUpscale;
const IMAGEKIT_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;
/**
 * Ensure we always transform ImageKit URLs
 */
function normalizeSrc(src) {
    if (!src.startsWith("http")) {
        throw new Error("Invalid image source");
    }
    return src;
}
/* ================= TRANSFORMS ================= */
function smartCrop(src) {
    src = normalizeSrc(src);
    return `${src}?tr=c-at_max,w-1024,h-1024`;
}
function removeBackground(src) {
    src = normalizeSrc(src);
    return `${src}?tr=bg-remove`;
}
function upscale(src) {
    src = normalizeSrc(src);
    return `${src}?tr=w-2048,h-2048`;
}
function enhance(src) {
    src = normalizeSrc(src);
    return `${src}?tr=e-sharpen,e-contrast,e-brightness`;
}
function enhanceAndUpscale(src) {
    src = normalizeSrc(src);
    return `${src}?tr=w-2048,h-2048,e-sharpen,e-contrast,e-brightness`;
}
