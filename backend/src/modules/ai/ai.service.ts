/* ======================================================
   IMAGEKIT AI TRANSFORM SERVICE
====================================================== */

const IMAGEKIT_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT!;

/**
 * Ensure we always transform ImageKit URLs
 */
function normalizeSrc(src: string): string {
  if (!src.startsWith("http")) {
    throw new Error("Invalid image source");
  }
  return src;
}

/* ================= TRANSFORMS ================= */

export function smartCrop(src: string): string {
  src = normalizeSrc(src);
  return `${src}?tr=c-at_max,w-1024,h-1024`;
}

export function removeBackground(src: string): string {
  src = normalizeSrc(src);
  return `${src}?tr=bg-remove`;
}

export function upscale(src: string): string {
  src = normalizeSrc(src);
  return `${src}?tr=w-2048,h-2048`;
}

export function enhance(src: string): string {
  src = normalizeSrc(src);
  return `${src}?tr=e-sharpen,e-contrast,e-brightness`;
}

export function enhanceAndUpscale(src: string): string {
  src = normalizeSrc(src);
  return `${src}?tr=w-2048,h-2048,e-sharpen,e-contrast,e-brightness`;
}
