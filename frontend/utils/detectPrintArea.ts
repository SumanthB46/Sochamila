import { Side } from "@/types/editor";

export type PrintAreaRatio = { x: number; y: number; w: number; h: number };

export type DetectionRegion = "full" | "sleeve" | "chest" | "upper" | "lower" | "left-half" | "right-half";

/**
 * Detect print area bounds from a mask image
 * Mask should have transparent/non-printable areas and opaque/printable areas
 */
export async function detectPrintAreaFromMask(
  maskImageUrl: string,
  region: DetectionRegion = "full"
): Promise<PrintAreaRatio | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve(null);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Define region constraints
      const regionBounds = getRegionBounds(region, canvas.width, canvas.height);
      
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      let hasOpaque = false;
      
      // Scan for non-transparent pixels within region bounds
      for (let y = regionBounds.yMin; y < regionBounds.yMax; y++) {
        for (let x = regionBounds.xMin; x < regionBounds.xMax; x++) {
          const alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 10) { // Not transparent
            hasOpaque = true;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      if (!hasOpaque) {
        resolve(null);
        return;
      }
      
      // Return as ratios (0-1)
      resolve({
        x: minX / canvas.width,
        y: minY / canvas.height,
        w: (maxX - minX) / canvas.width,
        h: (maxY - minY) / canvas.height,
      });
    };
    
    img.onerror = () => resolve(null);
    img.src = maskImageUrl;
  });
}

/**
 * Get pixel bounds for a detection region
 */
function getRegionBounds(
  region: DetectionRegion,
  width: number,
  height: number
): { xMin: number; yMin: number; xMax: number; yMax: number } {
  switch (region) {
    case "sleeve":
      // For side views: focus on the sleeve area only
      // Narrower width to capture just the sleeve, not the body
      // Extended vertical range for full sleeve length (from shoulder to cuff)
      return {
        xMin: Math.floor(width * 0.35),
        yMin: Math.floor(height * 0.15),
        xMax: Math.ceil(width * 0.65),
        yMax: Math.ceil(height * 0.90),
      };
    case "chest":
      // For front/back views: focus on upper-middle chest area
      return {
        xMin: Math.floor(width * 0.20),
        yMin: Math.floor(height * 0.25),
        xMax: Math.ceil(width * 0.80),
        yMax: Math.ceil(height * 0.65),
      };
    case "upper":
      // Top half
      return {
        xMin: 0,
        yMin: 0,
        xMax: width,
        yMax: Math.ceil(height * 0.60),
      };
    case "lower":
      // Bottom half
      return {
        xMin: 0,
        yMin: Math.floor(height * 0.40),
        xMax: width,
        yMax: height,
      };
    case "left-half":
      return {
        xMin: 0,
        yMin: 0,
        xMax: Math.ceil(width * 0.50),
        yMax: height,
      };
    case "right-half":
      return {
        xMin: Math.floor(width * 0.50),
        yMin: 0,
        xMax: width,
        yMax: height,
      };
    case "full":
    default:
      return {
        xMin: 0,
        yMin: 0,
        xMax: width,
        yMax: height,
      };
  }
}

/**
 * Detect print area for a specific side with appropriate region constraints
 */
export async function detectPrintAreaForSide(
  maskImageUrl: string,
  side: Side
): Promise<PrintAreaRatio | null> {
  // Map sides to appropriate detection regions
  const regionMap: Record<Side, DetectionRegion> = {
    front: "chest",
    back: "chest",
    left: "sleeve",
    right: "sleeve",
  };
  
  return detectPrintAreaFromMask(maskImageUrl, regionMap[side]);
}

/**
 * Detect print area from product image by finding non-background pixels
 * Works best when product is on a solid/transparent background
 */
export async function detectPrintAreaFromImage(
  imageUrl: string,
  options: {
    backgroundColor?: string;
    threshold?: number;
    padding?: number;
  } = {}
): Promise<PrintAreaRatio | null> {
  const { 
    backgroundColor = "white", 
    threshold = 30,
    padding = 0.05 
  } = options;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        resolve(null);
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Parse background color to RGB
      const bgRgb = hexToRgb(backgroundColor) || { r: 255, g: 255, b: 255 };
      
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;
      let hasContent = false;
      
      // Find pixels that are different from background
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const i = (y * canvas.width + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          const colorDiff = Math.abs(r - bgRgb.r) + Math.abs(g - bgRgb.g) + Math.abs(b - bgRgb.b);
          if (colorDiff > threshold) {
            hasContent = true;
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }
      
      if (!hasContent) {
        resolve(null);
        return;
      }
      
      // Apply padding and return ratios
      const w = maxX - minX;
      const h = maxY - minY;
      
      resolve({
        x: (minX + w * padding) / canvas.width,
        y: (minY + h * padding) / canvas.height,
        w: (w * (1 - padding * 2)) / canvas.width,
        h: (h * (1 - padding * 2)) / canvas.height,
      });
    };
    
    img.onerror = () => resolve(null);
    img.src = imageUrl;
  });
}

/**
 * Generate print area ratios for all sides from mask images
 * Uses side-specific detection regions (sleeve for left/right, chest for front/back)
 */
export async function generatePrintProfileFromMasks(
  masks: Record<Side, string>,
  sides: Side[]
): Promise<Record<Side, PrintAreaRatio>> {
  const ratios: Partial<Record<Side, PrintAreaRatio>> = {};
  
  for (const side of sides) {
    const maskUrl = masks[side];
    if (maskUrl) {
      // Use side-specific detection for better accuracy
      const ratio = await detectPrintAreaForSide(maskUrl, side);
      if (ratio) {
        ratios[side] = ratio;
      }
    }
  }
  
  return ratios as Record<Side, PrintAreaRatio>;
}

/**
 * Apply size scaling to a print area ratio
 */
export function applySizeScaling(
  ratio: PrintAreaRatio,
  size: string,
  baseSize: string = "M"
): PrintAreaRatio {
  const SIZE_SCALING_FACTORS: Record<string, number> = {
    XS: 0.85,
    S: 0.92,
    M: 1.0,
    L: 1.08,
    XL: 1.15,
    "2XL": 1.22,
    XXL: 1.22,
    "3XL": 1.30,
    XXXL: 1.30,
  };
  
  const baseScale = SIZE_SCALING_FACTORS[baseSize] || 1.0;
  const targetScale = SIZE_SCALING_FACTORS[size] || 1.0;
  const scale = targetScale / baseScale;
  
  // Scale from center
  const centerX = ratio.x + ratio.w / 2;
  const centerY = ratio.y + ratio.h / 2;
  
  return {
    x: centerX - (ratio.w * scale) / 2,
    y: centerY - (ratio.h * scale) / 2,
    w: ratio.w * scale,
    h: ratio.h * scale,
  };
}

// Helper function
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    };
  }
  
  // Handle named colors
  const namedColors: Record<string, string> = {
    white: "#FFFFFF",
    black: "#000000",
    transparent: "#000000",
  };
  
  if (namedColors[hex.toLowerCase()]) {
    return hexToRgb(namedColors[hex.toLowerCase()]);
  }
  
  return null;
}
