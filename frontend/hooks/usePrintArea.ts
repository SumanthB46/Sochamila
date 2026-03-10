"use client";

import { useState, useEffect, useCallback } from "react";
import { Side } from "@/types/editor";
import { 
  PrintAreaRatio, 
  DetectionRegion,
  detectPrintAreaFromMask,
  detectPrintAreaForSide,
  detectPrintAreaFromImage,
  applySizeScaling 
} from "@/utils/detectPrintArea";

interface UsePrintAreaOptions {
  maskUrl?: string;
  imageUrl?: string;
  side: Side;
  size?: string;
  baseSize?: string;
  canvasDimensions?: { width: number; height: number };
  autoDetect?: boolean;
  backgroundColor?: string;
  region?: DetectionRegion; // Override region detection
  useSideSpecificDetection?: boolean; // Use side-specific regions (default: true)
}

interface UsePrintAreaReturn {
  ratio: PrintAreaRatio | null;
  absoluteArea: { x: number; y: number; w: number; h: number } | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * React hook for dynamic print area detection
 * Automatically detects print area from mask or image
 */
export function usePrintArea(options: UsePrintAreaOptions): UsePrintAreaReturn {
  const {
    maskUrl,
    imageUrl,
    side,
    size,
    baseSize = "M",
    canvasDimensions = { width: 800, height: 1000 },
    autoDetect = true,
    backgroundColor = "white",
    region,
    useSideSpecificDetection = true,
  } = options;

  const [ratio, setRatio] = useState<PrintAreaRatio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const detectPrintArea = useCallback(async () => {
    if (!autoDetect) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let detectedRatio: PrintAreaRatio | null = null;

      // Priority: mask detection > image detection
      if (maskUrl) {
        if (region) {
          // Use explicit region override
          detectedRatio = await detectPrintAreaFromMask(maskUrl, region);
        } else if (useSideSpecificDetection) {
          // Use side-specific detection (sleeve for left/right, chest for front/back)
          detectedRatio = await detectPrintAreaForSide(maskUrl, side);
        } else {
          // Full image detection
          detectedRatio = await detectPrintAreaFromMask(maskUrl);
        }
      } else if (imageUrl) {
        detectedRatio = await detectPrintAreaFromImage(imageUrl, {
          backgroundColor,
        });
      }

      if (detectedRatio) {
        setRatio(detectedRatio);
      } else {
        setError("Failed to detect print area");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [maskUrl, imageUrl, autoDetect, backgroundColor]);

  useEffect(() => {
    detectPrintArea();
  }, [detectPrintArea, refreshKey]);

  // Calculate absolute area with size scaling
  const absoluteArea = (() => {
    if (!ratio) return null;

    let finalRatio = ratio;
    if (size) {
      finalRatio = applySizeScaling(ratio, size, baseSize);
    }

    return {
      x: finalRatio.x * canvasDimensions.width,
      y: finalRatio.y * canvasDimensions.height,
      w: finalRatio.w * canvasDimensions.width,
      h: finalRatio.h * canvasDimensions.height,
    };
  })();

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    ratio,
    absoluteArea,
    isLoading,
    error,
    refresh,
  };
}

/**
 * Hook for managing print areas for multiple sides
 */
export function useMultiSidePrintArea(
  sides: Side[],
  getMaskUrl: (side: Side) => string | undefined,
  options: Omit<UsePrintAreaOptions, "side" | "maskUrl"> = {}
) {
  const [ratios, setRatios] = useState<Record<Side, PrintAreaRatio | null>>(
    {} as Record<Side, PrintAreaRatio | null>
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const detectAll = async () => {
      setIsLoading(true);
      const newRatios: Record<Side, PrintAreaRatio | null> = {} as Record<
        Side,
        PrintAreaRatio | null
      >;

      for (const side of sides) {
        const maskUrl = getMaskUrl(side);
        if (maskUrl) {
          newRatios[side] = await detectPrintAreaFromMask(maskUrl);
        } else {
          newRatios[side] = null;
        }
      }

      setRatios(newRatios);
      setIsLoading(false);
    };

    if (options.autoDetect !== false) {
      detectAll();
    }
  }, [sides, getMaskUrl, options.autoDetect]);

  const getAbsoluteArea = useCallback(
    (side: Side) => {
      const ratio = ratios[side];
      if (!ratio) return null;

      let finalRatio = ratio;
      if (options.size) {
        finalRatio = applySizeScaling(ratio, options.size, options.baseSize || "M");
      }

      const dims = options.canvasDimensions || { width: 800, height: 1000 };
      return {
        x: finalRatio.x * dims.width,
        y: finalRatio.y * dims.height,
        w: finalRatio.w * dims.width,
        h: finalRatio.h * dims.height,
      };
    },
    [ratios, options.size, options.baseSize, options.canvasDimensions]
  );

  return {
    ratios,
    isLoading,
    getAbsoluteArea,
  };
}
