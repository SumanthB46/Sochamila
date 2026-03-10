import { Side, EditorLayer } from "@/types/editor";
import { PrintAreaRatio, detectPrintAreaForSide, applySizeScaling } from "@/utils/detectPrintArea";

export type { PrintAreaRatio };

export type PrintProfile = {
  id: string;
  label: string;
  sides: Side[];
  masks: Record<Side, string>;
  printAreaRatio: Record<Side, PrintAreaRatio>;
  canvasDimensions: { width: number; height: number };
  minFontSize?: number;
  maxFontSize?: number;
  safetyMargin?: number;

  // Dynamic print area detection
  autoDetectFromMask?: boolean;
  sizeScaling?: boolean;
  baseSize?: string;
};

export const PRINT_PROFILES: Record<string, PrintProfile> = {
  tshirt: {
    id: "tshirt",
    label: "T-Shirt",
    sides: ["front", "back", "right", "left"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 12,
    maxFontSize: 120,
    safetyMargin: 20,

    masks: {
      front: "/masks/tshirt/front.png",
      back: "/masks/tshirt/back.png",
      left: "/masks/tshirt/left.png",
      right: "/masks/tshirt/right.png",
    },

    printAreaRatio: {
      /* Main body - centered, conservative */
      front: { x: 0.27, y: 0.20, w: 0.44, h: 0.66 },
      back: { x: 0.26, y: 0.19, w: 0.46, h: 0.67 },

      /* Short sleeves - smaller, centered on sleeve */
      left: { x: 0.32, y: 0.38, w: 0.45, h: 0.45 },
      right: { x: 0.23, y: 0.39, w: 0.40, h: 0.43 },
    },
  },

  longsleeve: {
    id: "longsleeve",
    label: "Long Sleeve T-Shirt",
    sides: ["front", "back", "right", "left"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 12,
    maxFontSize: 120,
    safetyMargin: 20,

    masks: {
      front: "/masks/longsleeve/front.png",
      back: "/masks/longsleeve/back.png",
      left: "/masks/longsleeve/left.png",
      right: "/masks/longsleeve/right.png",
    },

    printAreaRatio: {
      /* Main body - centered, conservative */
      front: { x: 0.36, y: 0.20, w: 0.44, h: 0.58 },
      back: { x: 0.28, y: 0.25, w: 0.44, h: 0.55 },

      /* Long sleeves - narrower to fit sleeve width */
      left: { x: 0.12, y: 0.29, w: 0.36, h: 0.58 },
      right: { x: 0.1, y: 0.20, w: 0.34, h: 0.58 },
    },
  },

  jersey: {
    id: "jersey",
    label: "Jersey",
    sides: ["front", "back"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 14,
    maxFontSize: 130,
    safetyMargin: 15,

    masks: {
      front: "/masks/jersey/front.webp",
      back: "/masks/jersey/back.webp",
      left: "/masks/jersey/left.webp",
      right: "/masks/jersey/right.webp",
    },

    printAreaRatio: {
      /* Jersey - centered chest area */
      front: { x: 0.25, y: 0.22, w: 0.50, h: 0.60 },
      back: { x: 0.25, y: 0.22, w: 0.50, h: 0.60 },

      /* Jersey sleeves - small centered area */
      left: { x: 0.38, y: 0.35, w: 0.24, h: 0.30 },
      right: { x: 0.38, y: 0.35, w: 0.24, h: 0.30 },
    },
  },

  shirt: {
    id: "shirt",
    label: "Shirt",
    sides: ["front", "back", "right", "left"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 12,
    maxFontSize: 120,
    safetyMargin: 20,

    masks: {
      front: "/masks/shirt/front.png",
      back: "/masks/shirt/back.png",
      left: "/masks/shirt/left.png",
      right: "/masks/shirt/right.png",
    },

    printAreaRatio: {
      /* Button-up shirt - conservative chest area */
      front: { x: 0.26, y: 0.26, w: 0.48, h: 0.55 },
      back: { x: 0.26, y: 0.26, w: 0.48, h: 0.55 },

      /* Half sleeves - shorter and centered */
      left: { x: 0.32, y: 0.32, w: 0.36, h: 0.35 },
      right: { x: 0.32, y: 0.32, w: 0.36, h: 0.35 },
    },
  },

  sweatshirt: {
    id: "sweatshirt",
    label: "Sweatshirt",
    sides: ["front", "back", "right", "left"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 11,
    maxFontSize: 115,
    safetyMargin: 22,
    autoDetectFromMask: true,  // Enable dynamic detection from masks
    sizeScaling: true,
    baseSize: "M",

    masks: {
      front: "/masks/sweatshirt/front.webp",
      back: "/masks/sweatshirt/back.webp",
      left: "/masks/sweatshirt/left.webp",
      right: "/masks/sweatshirt/right.webp",
    },

    printAreaRatio: {
      /* Sweatshirt - centered, well within boundaries */
      front: { x: 0.20, y: 0.60, w: 0.44, h: 0.59 },
      back: { x: 0.28, y: 0.6, w: 0.44, h: 0.52 },

      /* Long sleeves - extended length for sweatshirt (fallback values) */
      left: { x: 0.36, y: 0.18, w: 0.28, h: 0.62 },
      right: { x: 0.11, y: 0.12, w: 0.28, h: 0.69 },
    },
  },

  jacket: {
    id: "jacket",
    label: "Jacket",
    sides: ["front", "back", "right", "left"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 10,
    maxFontSize: 130,
    safetyMargin: 25,

    masks: {
      front: "/masks/jacket/front.png",
      back: "/masks/jacket/back.png",
      left: "/masks/jacket/left.png",
      right: "/masks/jacket/right.png",
    },

    printAreaRatio: {
      /* Jacket - conservative chest area */
      front: { x: 0.26, y: 0.24, w: 0.48, h: 0.58 },
      back: { x: 0.26, y: 0.24, w: 0.48, h: 0.58 },

      /* Long sleeves - moderate size */
      left: { x: 0.30, y: 0.18, w: 0.40, h: 0.64 },
      right: { x: 0.30, y: 0.18, w: 0.40, h: 0.64 },
    },
  },

  hoodie: {
    id: "hoodie",
    label: "Hoodie",
    sides: ["front", "back", "right", "left"],
    canvasDimensions: { width: 800, height: 1000 },
    minFontSize: 10,
    maxFontSize: 110,
    safetyMargin: 25,

    masks: {
      front: "/masks/hoodie/front.png",
      back: "/masks/hoodie/back.png",
      left: "/masks/hoodie/left.png",
      right: "/masks/hoodie/right.png",
    },

    printAreaRatio: {
      /* Hoodie - centered chest area */
      front: { x: 0.28, y: 0.28, w: 0.44, h: 0.50 },
      back: { x: 0.28, y: 0.28, w: 0.44, h: 0.50 },

      /* Long sleeves - narrower to fit */
      left: { x: 0.32, y: 0.20, w: 0.36, h: 0.60 },
      right: { x: 0.32, y: 0.20, w: 0.36, h: 0.60 },
    },
  },
};

/* =========================================================
   AUTO-ADJUSTMENT UTILITIES
========================================================= */

/**
 * Get absolute print area dimensions for a product and side
 * Supports dynamic detection from masks and size scaling
 */
export function getPrintArea(
  profileId: string,
  side: Side,
  size?: string
): { x: number; y: number; w: number; h: number } | null {
  const profile = PRINT_PROFILES[profileId];
  if (!profile) return null;

  let ratio = profile.printAreaRatio[side];
  if (!ratio) return null;

  // Apply size scaling if enabled and size provided
  if (profile.sizeScaling && size) {
    ratio = applySizeScaling(ratio, size, profile.baseSize || "M");
  }

  const { width, height } = profile.canvasDimensions;
  return {
    x: ratio.x * width,
    y: ratio.y * height,
    w: ratio.w * width,
    h: ratio.h * height,
  };
}

/**
 * Async version that auto-detects print area from mask if enabled
 */
export async function getPrintAreaAsync(
  profileId: string,
  side: Side,
  size?: string
): Promise<{ x: number; y: number; w: number; h: number } | null> {
  const profile = PRINT_PROFILES[profileId];
  if (!profile) return null;

  let ratio: PrintAreaRatio | null = profile.printAreaRatio[side];

  // Auto-detect from mask if enabled (uses side-specific detection)
  if (profile.autoDetectFromMask && profile.masks[side]) {
    const detectedRatio = await detectPrintAreaForSide(profile.masks[side], side);
    if (detectedRatio) {
      ratio = detectedRatio;
    }
  }

  if (!ratio) return null;

  // Apply size scaling if enabled and size provided
  if (profile.sizeScaling && size) {
    ratio = applySizeScaling(ratio, size, profile.baseSize || "M");
  }

  const { width, height } = profile.canvasDimensions;
  return {
    x: ratio.x * width,
    y: ratio.y * height,
    w: ratio.w * width,
    h: ratio.h * height,
  };
}

/**
 * Get print area with custom ratios (for dynamically uploaded products)
 */
export function getPrintAreaWithRatio(
  ratio: PrintAreaRatio,
  canvasDimensions: { width: number; height: number },
  size?: string,
  baseSize?: string
): { x: number; y: number; w: number; h: number } {
  let finalRatio = ratio;

  // Apply size scaling if size provided
  if (size && baseSize) {
    finalRatio = applySizeScaling(ratio, size, baseSize);
  }

  return {
    x: finalRatio.x * canvasDimensions.width,
    y: finalRatio.y * canvasDimensions.height,
    w: finalRatio.w * canvasDimensions.width,
    h: finalRatio.h * canvasDimensions.height,
  };
}

/**
 * Check if a layer fits within the print area
 */
export function isLayerInPrintArea(
  profileId: string,
  side: Side,
  layer: { x: number; y: number; width: number; height: number },
  size?: string
): boolean {
  const printArea = getPrintArea(profileId, side, size);
  if (!printArea) return false;

  const margin = PRINT_PROFILES[profileId]?.safetyMargin || 0;

  return (
    layer.x >= printArea.x + margin &&
    layer.y >= printArea.y + margin &&
    layer.x + layer.width <= printArea.x + printArea.w - margin &&
    layer.y + layer.height <= printArea.y + printArea.h - margin
  );
}

/**
 * Auto-adjust layer to fit within print area
 */
export function autoAdjustLayer(
  profileId: string,
  side: Side,
  layer: { x: number; y: number; width: number; height: number },
  size?: string
): { x: number; y: number; width: number; height: number } {
  const profile = PRINT_PROFILES[profileId];
  const printArea = getPrintArea(profileId, side, size);

  if (!profile || !printArea) return layer;

  const margin = profile.safetyMargin || 0;
  const minX = printArea.x + margin;
  const minY = printArea.y + margin;
  const maxX = printArea.x + printArea.w - margin;
  const maxY = printArea.y + printArea.h - margin;

  let { x, y, width, height } = layer;

  // If layer is too wide, scale it down
  if (width > maxX - minX) {
    const scale = (maxX - minX) / width;
    width *= scale;
    height *= scale;
  }

  // If layer is too tall, scale it down
  if (height > maxY - minY) {
    const scale = (maxY - minY) / height;
    width *= scale;
    height *= scale;
  }

  // Clamp position to bounds
  x = Math.max(minX, Math.min(x, maxX - width));
  y = Math.max(minY, Math.min(y, maxY - height));

  return { x, y, width, height };
}

/**
 * Center layer within print area
 */
export function centerLayerInPrintArea(
  profileId: string,
  side: Side,
  layer: { x: number; y: number; width: number; height: number },
  size?: string
): { x: number; y: number } {
  const printArea = getPrintArea(profileId, side, size);
  if (!printArea) return { x: layer.x, y: layer.y };

  const centerX = printArea.x + printArea.w / 2 - layer.width / 2;
  const centerY = printArea.y + printArea.h / 2 - layer.height / 2;

  return { x: centerX, y: centerY };
}

/**
 * Validate and clamp text font size for product
 */
export function getOptimalFontSize(
  profileId: string,
  requestedSize: number
): number {
  const profile = PRINT_PROFILES[profileId];
  if (!profile) return requestedSize;

  const min = profile.minFontSize || 8;
  const max = profile.maxFontSize || 200;

  return Math.max(min, Math.min(requestedSize, max));
}

/**
 * Get product by ID
 */
export function getProfile(profileId: string): PrintProfile | null {
  return PRINT_PROFILES[profileId] || null;
}
