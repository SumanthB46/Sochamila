"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";

import {
  EditorLayer,
  Side,
  TextLayer,
  ImageLayer,
  StickerLayer,
  PatternLayer,
  isTextLayer,
  isImageLayer,
  isStickerLayer,
  isPatternLayer,
} from "@/types/editor";

import { loadGoogleFont } from "@/utils/loadGoogleFont";
import { PRINT_PROFILES, getPrintArea } from "@/config/printProfiles";
import { usePrintArea } from "@/hooks/usePrintArea";

/* ======================================================
   TYPES
====================================================== */

type ImageWithView = { image: string; view?: string };

interface EditorCanvasProps {
  product: {
    type?: keyof typeof PRINT_PROFILES;
    productType?: string;
    images: string[] | ImageWithView[];
    imagesWithView?: ImageWithView[];
  };
  side: Side;
  selectedColor: string;

  layers: EditorLayer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;

  updateLayer: <T extends EditorLayer["type"]>(
    id: string,
    type: T,
    patch: Omit<
      Partial<Extract<EditorLayer, { type: T }>>,
      "type"
    >
  ) => void;

  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  rotateLayer: (id: string, angle: number) => void;

  /** When true, hide selection UI and labels so captured preview shows only the design */
  captureMode?: boolean;
  
  /** Side selection props */
  availableSides?: Side[];
  onSideChange?: (side: Side) => void;
  
  /** When true, hide side selector (for fullscreen mode) */
  hideSideSelector?: boolean;
  
  /** When true, enable zoom functionality (for fullscreen mode) */
  enableZoom?: boolean;
}

/* ======================================================
   CONSTANTS
====================================================== */

const API_URL = "http://localhost:5000";
const CANVAS_SIZE = { w: 420, h: 520 };
const DEFAULT_TEXT_SIZE = { w: 200, h: 80 };

/* ======================================================
   HELPERS
====================================================== */

function toFullUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `${API_URL}${path}`;
  if (path.startsWith("/")) return `${API_URL}${path}`;
  return `${API_URL}/uploads/${path}`;
}

function resolveProductImage(
  imagesWithView: ImageWithView[] | undefined,
  fallbackImages: string[] | ImageWithView[],
  side: Side
): string | null {
  // Prefer images with view (front, back, left, right) from API
  if (imagesWithView?.length) {
    const sideUpper = side.toUpperCase();
    const match = imagesWithView.find(
      (img) => img.view?.toUpperCase() === sideUpper
    );
    if (match?.image) return toFullUrl(match.image);
    // Fallback: use sort order 0=front, 1=back, 2=right, 3=left
    const order = ["front", "back", "right", "left"].indexOf(side);
    if (order >= 0 && imagesWithView[order]?.image) {
      return toFullUrl(imagesWithView[order].image);
    }
    if (imagesWithView[0]?.image) return toFullUrl(imagesWithView[0].image);
  }

  // Legacy: no view info, use first image for all sides
  const flat = Array.isArray(fallbackImages) ? fallbackImages : [];
  if (!flat.length) return null;
  const first = flat[0];
  const path = typeof first === "string" ? first : (first as ImageWithView).image;
  return path ? toFullUrl(path) : null;
}

/* ======================================================
   COMPONENT
====================================================== */

const EditorCanvas = React.forwardRef<HTMLDivElement, EditorCanvasProps>(
  function EditorCanvas({
    product,
    side,
    selectedColor,
    layers,
    selectedLayerId,
    setSelectedLayerId,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    rotateLayer,
    captureMode = false,
    availableSides = ["front", "back", "right", "left"],
    onSideChange,
    hideSideSelector = false,
    enableZoom = false,
  }, ref) {
  const [zoom, setZoom] = useState(1);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  
  // Reset zoom when exiting fullscreen (enableZoom changes from true to false)
  useEffect(() => {
    if (!enableZoom) {
      setZoom(1);
    }
  }, [enableZoom]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] =
    useState(CANVAS_SIZE);

  /* ================= FORWARD REF ================= */
  useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

  /* ================= DELETE KEY ================= */

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedLayerId
      ) {
        deleteLayer(selectedLayerId);
      }
    };

    window.addEventListener("keydown", handler);
    return () =>
      window.removeEventListener("keydown", handler);
  }, [selectedLayerId, deleteLayer]);

  /* ================= PROFILE ================= */

  // Map productType to lowercase print profile key
  const productTypeKey = product.productType?.toLowerCase() ?? "tshirt";
  const profile = PRINT_PROFILES[productTypeKey];

  const maskSrc = profile.masks[side];

  // Use dynamic print area detection when autoDetectFromMask is enabled
  const { absoluteArea: detectedPrintArea, isLoading: isDetectingPrintArea } = usePrintArea({
    maskUrl: maskSrc,
    side,
    canvasDimensions: { width: containerSize.w, height: containerSize.h },
    autoDetect: profile.autoDetectFromMask ?? false,
    useSideSpecificDetection: true,
  });

  // Fallback to static ratios if dynamic detection is not enabled or failed
  const staticRatio = profile.printAreaRatio[side];
  const staticPrintArea = useMemo(
    () => ({
      x: containerSize.w * staticRatio.x,
      y: containerSize.h * staticRatio.y,
      w: containerSize.w * staticRatio.w,
      h: containerSize.h * staticRatio.h,
    }),
    [containerSize, staticRatio]
  );

  // Use detected area if available, otherwise fall back to static
  const printArea = detectedPrintArea ?? staticPrintArea;

  /* ================= PRODUCT IMAGE ================= */

  const productImage = useMemo(
    () =>
      resolveProductImage(
        product.imagesWithView,
        product.images,
        side
      ),
    [product.imagesWithView, product.images, side]
  );

  /* ================= VISIBLE LAYERS ================= */

  const visibleLayers = useMemo(
    () =>
      layers
        .filter(
          (layer: EditorLayer) =>
            layer.side === side &&
            layer.visible !== false
        )
        .sort(
          (a: EditorLayer, b: EditorLayer) =>
            a.zIndex - b.zIndex
        ),
    [layers, side]
  );

  /* ================= AUTO-ADJUST LAYER HEIGHT ================= */

  const getAutoLayerHeight = (layer: EditorLayer, defaultHeight: number): number => {
    if (!isTextLayer(layer)) return defaultHeight;
    
    const textLayer = layer as TextLayer;
    const lineHeightValue = textLayer.lineHeight ?? 1.2;
    const calculatedHeight = Math.ceil(
      textLayer.fontSize * lineHeightValue * 1.5
    );
    
    return Math.max(calculatedHeight, defaultHeight);
  };

  /* ================= RESIZE OBSERVER ================= */

  useEffect(() => {
    if (!containerRef.current) return;

    const el = containerRef.current;
    const ro = new ResizeObserver(() => {
      setContainerSize({
        w: el.clientWidth,
        h: el.clientHeight,
      });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ======================================================
     UI
  ====================================================== */

  const sideLabels: Record<Side, string> = {
    front: "Front",
    back: "Back",
    left: "Left",
    right: "Right",
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 p-4 lg:px-8 overflow-hidden">
      {/* Zoom Controls - Only visible when zoom is enabled */}
      {enableZoom && (
        <div className="absolute top-4 left-4 z-50 flex items-center gap-2 bg-white rounded-lg shadow-lg p-2">
          <button
            onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold"
          >
            −
          </button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(3, z + 0.25))}
            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded text-lg font-bold"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
          >
            Reset
          </button>
        </div>
      )}
      
      {/* Scrollable Container for Zoomed Canvas */}
      <div className={`flex-1 flex items-center justify-center ${enableZoom ? 'overflow-auto w-full h-full' : 'overflow-hidden'}`}>
        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="relative w-[280px] h-[350px] sm:w-[350px] sm:h-[440px] lg:w-[420px] lg:h-[520px] rounded-2xl shadow-xl transition-transform flex-shrink-0"
          style={{ 
            backgroundColor: backgroundColor,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            margin: zoom > 1 ? 'auto' : undefined
          }}
          onMouseDown={() => setSelectedLayerId(null)}
        >
        {/* PRODUCT IMAGE */}
        {productImage ? (
          <img
            src={productImage}
            crossOrigin="anonymous"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
            No product image - Design with AI
          </div>
        )}

        {/* MASK - Shows product shape */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            WebkitMaskImage: `url(${maskSrc})`,
            maskImage: `url(${maskSrc})`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        >
          {/* PRINT AREA BOUNDARY - Clips content to print area */}
          <div
            className="absolute"
            style={{
              left: printArea.x,
              top: printArea.y,
              width: printArea.w,
              height: printArea.h,
              outline: !captureMode ? '1px dashed rgba(99, 102, 241, 0.5)' : 'none',
              overflow: 'hidden',
              position: 'absolute',
            }}
          >
            {visibleLayers.map((layer: EditorLayer) => {
              const selected =
                layer.id === selectedLayerId;

              const width =
                layer.width ?? DEFAULT_TEXT_SIZE.w;
              const height =
                layer.height ?? DEFAULT_TEXT_SIZE.h;

              const x =
                layer.x ?? (printArea.w - width) / 2;
              const y =
                layer.y ?? (printArea.h - height) / 2;

              // Auto-adjust height for text layers based on content
              const layerHeight = getAutoLayerHeight(layer, height);

              return (
                <Rnd
                  key={layer.id}
                  bounds="parent"
                  size={{ width, height: layerHeight }}
                  position={{ x, y }}
                  onMouseDown={e => {
                    e.stopPropagation();
                    setSelectedLayerId(layer.id);
                  }}
                  onDragStop={(_, d) =>
                    updateLayer(layer.id, layer.type, {
                      x: d.x,
                      y: d.y,
                    })
                  }
                  onResizeStop={(_, __, ref, ___, pos) => {
                    const newWidth = ref.offsetWidth;
                    const newHeight = ref.offsetHeight;
                    const widthRatio = newWidth / (width || 1);
                    
                    // For text layers, scale the font size with the width
                    const patch: any = {
                      width: newWidth,
                      height: newHeight,
                      x: pos.x,
                      y: pos.y,
                    };
                    
                    if (isTextLayer(layer)) {
                      const textLayer = layer as TextLayer;
                      const newFontSize = Math.max(8, Math.round(textLayer.fontSize * widthRatio));
                      patch.fontSize = newFontSize;
                    }
                    
                    updateLayer(layer.id, layer.type, patch);
                  }}
                  style={{
                    outline: !captureMode && selected
                      ? "2px solid #6366f1"
                      : "none",
                    zIndex: selected
                      ? 999
                      : layer.zIndex,
                    overflow: 'hidden',
                  }}
                  className={`${!captureMode && selected ? "shadow-lg ring-2 ring-indigo-500" : ""}`}
                >
                  {!captureMode && selected && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1.5 rounded whitespace-nowrap z-50 flex items-center gap-1.5 shadow-lg ring-1 ring-indigo-700 pointer-events-auto">
                      <span className="flex items-center gap-1">
                        <span>{isTextLayer(layer) ? "TEXT" : isImageLayer(layer) || isStickerLayer(layer) ? "IMAGE" : "PATTERN"}</span>
                        <span className="text-indigo-200">·</span>
                        <span>{layer.rotation || 0}°</span>
                      </span>
                      <div className="flex gap-1 ml-1 border-l border-indigo-400 pl-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            rotateLayer(layer.id, 45);
                          }}
                          className="p-0.5 hover:bg-indigo-700 rounded transition text-indigo-100 hover:text-white"
                          title="Rotate 45°"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateLayer(layer.id);
                          }}
                          className="p-0.5 hover:bg-indigo-700 rounded transition text-indigo-100 hover:text-white"
                          title="Duplicate"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                          className="p-0.5 hover:bg-red-500 rounded transition text-indigo-100 hover:text-white"
                          title="Delete"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                  <div
                    className="w-full h-full flex items-center justify-center overflow-hidden min-h-0"
                    style={{
                      transform: `rotate(${layer.rotation || 0}deg)`,
                    }}
                  >
                    {isTextLayer(layer) ? (
                      <EnhancedText layer={layer} />
                    ) : isImageLayer(layer) || isStickerLayer(layer) ? (
                      <img
                        src={layer.src}
                        crossOrigin={layer.src.startsWith("data:") ? undefined : "anonymous"}
                        className="w-full h-full object-contain"
                        style={{
                          opacity: layer.opacity ?? 1,
                        }}
                        draggable={false}
                      />
                    ) : (
                      <PatternRenderer layer={layer} />
                    )}
                  </div>
                </Rnd>
              );
            })}
          </div>
        </div>

        {!captureMode && (
          <span className="absolute top-4 right-4 bg-black text-white text-[10px] px-3 py-1 rounded-full">
            {selectedColor.toUpperCase()} · {side.toUpperCase()}
          </span>
        )}
        </div>
      </div>

      {/* Background Color & Side Selector - Below Canvas */}
      {!captureMode && !hideSideSelector && (
        <div className="mt-4 flex items-center gap-4">
          {/* Background Color Picker */}
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm">
            <label className="text-xs font-medium text-gray-700 whitespace-nowrap">Canvas:</label>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              title="Change canvas background color"
            />
            <button
              onClick={() => setBackgroundColor("#ffffff")}
              className="text-xs px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition"
              title="Reset to white"
            >
              Reset
            </button>
          </div>

          {/* Side Selector */}
          {onSideChange && (
            <div className="flex items-center gap-2">
              {availableSides.map((s) => (
                <button
                  key={s}
                  onClick={() => onSideChange(s)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 border-2 rounded-lg transition-all ${
                    side === s
                      ? "border-teal-600 bg-teal-50 shadow-md"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                  title={sideLabels[s]}
                >
                  <span className={`text-xs font-medium capitalize ${
                    side === s ? "text-teal-700" : "text-gray-600"
                  }`}>
                    {sideLabels[s]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
  }
);

export default EditorCanvas;

/* ======================================================
   TEXT
====================================================== */

function EnhancedText({ layer }: { layer: TextLayer }) {
  const [fontLoaded, setFontLoaded] = useState(true);

  useEffect(() => {
    setFontLoaded(false);
    loadGoogleFont(layer.fontFamily);
    
    // Force re-render after font loads to apply new font
    const timer = setTimeout(() => {
      setFontLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [layer.fontFamily]);

  // Properly format the CSS font family string with quotes for multi-word fonts
  const fontFamilyCSS = layer.fontFamily.includes(" ") 
    ? `"${layer.fontFamily}", "Noto Sans", sans-serif`
    : `${layer.fontFamily}, "Noto Sans", sans-serif`;

  const style: React.CSSProperties = {
    fontFamily: fontFamilyCSS,
    fontSize: `${layer.fontSize}px`,
    fontWeight: layer.fontWeight,
    fontStyle: layer.isItalic ? "italic" : "normal",
    textDecoration: [
      layer.isUnderline ? "underline" : "",
      layer.isStrikethrough ? "line-through" : ""
    ].filter(Boolean).join(" ") || "none",
    letterSpacing: `${layer.letterSpacing ?? 0}px`,
    lineHeight: layer.lineHeight ?? 1.2,
    textAlign: layer.textAlign || "center",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflow: "hidden",
    color: layer.color,
    opacity: layer.opacity ?? 1,
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  };

  // Apply text style effects
  if (layer.textStyle === "shadow") {
    const offsetX = layer.shadowOffsetX ?? 2;
    const offsetY = layer.shadowOffsetY ?? 2;
    const blur = layer.shadowBlur ?? 4;
    const shadowCol = layer.shadowColor ?? "#000000";
    style.textShadow = `${offsetX}px ${offsetY}px ${blur}px ${shadowCol}`;
  }

  if (layer.textStyle === "outline") {
    style.color = "#fff";
    style.textShadow = `
      -1px -1px 0 #000,
       1px -1px 0 #000,
      -1px  1px 0 #000,
       1px  1px 0 #000
    `;
  }

  if (layer.textStyle === "3d") {
    const depth = layer.depth3d ?? 5;
    const angle = (layer.angle3d ?? 45) * Math.PI / 180;
    const offsetX = Math.round(Math.cos(angle) * depth);
    const offsetY = Math.round(Math.sin(angle) * depth);
    const shadowCol = layer.shadowColor ?? "#222";
    
    let shadows = [];
    for (let i = 1; i <= depth; i++) {
      shadows.push(`${i}px ${i}px 0 rgba(0,0,0,${0.3 * (i/depth)})`);
    }
    style.textShadow = shadows.join(", ");
  }

  if (layer.textStyle === "glow") {
    const glowCol = layer.glowColor ?? "#FF00FF";
    const glowSz = layer.glowSize ?? 5;
    style.textShadow = `0 0 ${glowSz}px ${glowCol}, 0 0 ${glowSz * 2}px ${glowCol}`;
    style.color = "#fff";
  }

  if (layer.textStyle === "emboss") {
    style.textShadow = `
      -2px -2px 2px rgba(255,255,255,0.5),
       2px  2px 2px rgba(0,0,0,0.5)
    `;
    style.fontWeight = 700;
  }

  if (layer.textStyle === "neon") {
    const glowCol = layer.glowColor ?? "#FF00FF";
    style.textShadow = `
      0 0 10px ${glowCol},
      0 0 20px ${glowCol},
      0 0 30px ${glowCol}
    `;
    style.color = "#fff";
    style.fontWeight = 700;
  }

  if (layer.textStyle === "gradient") {
    const startCol = layer.gradientStart ?? "#FF0000";
    const endCol = layer.gradientEnd ?? "#0000FF";
    const angle = layer.gradientAngle ?? 0;
    
    style.backgroundImage = `linear-gradient(${angle}deg, ${startCol}, ${endCol})`;
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.color = "transparent" as any;
  }

  if (layer.textStyle === "chrome") {
    style.backgroundImage = "linear-gradient(45deg, #C0C0C0, #E8E8E8, #C0C0C0, #E8E8E8)";
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.textShadow = "2px 2px 4px rgba(0,0,0,0.3)";
    style.fontWeight = 700;
  }

  if (layer.textStyle === "glass") {
    style.color = "rgba(255,255,255,0.8)";
    style.textShadow = `
      0 0 20px rgba(255,255,255,0.5),
      inset 0 0 20px rgba(255,255,255,0.2)
    `;
    style.backdropFilter = "blur(10px)" as any;
    style.fontWeight = 300;
    style.letterSpacing = "2px";
  }

  if (layer.textStyle === "fire") {
    const glowCol1 = "#FF0000";
    const glowCol2 = "#FF7F00";
    style.color = "#FFF";
    style.textShadow = `
      0 0 10px ${glowCol1},
      0 0 20px ${glowCol1},
      0 0 30px ${glowCol2},
      0 0 40px ${glowCol2}
    `;
    style.fontWeight = 700;
  }

  if (layer.textStyle === "wave") {
    style.textShadow = `
      0 2px 0 #999,
      0 4px 0 #888,
      0 6px 0 #777,
      0 8px 0 #666,
      0 10px 0 #555,
      0 12px 15px rgba(0,0,0,0.5)
    `;
    style.color = layer.color;
    style.fontWeight = 700;
  }

  if (layer.textStyle === "blur") {
    style.filter = "blur(1px)";
    style.textShadow = "0 0 10px rgba(0,0,0,0.3)";
    style.opacity = 0.85;
  }

  if (layer.textStyle && String(layer.textStyle) === "marble") {
    style.backgroundImage = "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
    style.backgroundClip = "text";
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
    style.textShadow = "2px 2px 8px rgba(0,0,0,0.2)";
    style.fontWeight = 700;
  }

  if (layer.textStyle && String(layer.textStyle) === "plasma") {
    const glowCol = "#FF00FF";
    style.color = "#00FFFF";
    style.textShadow = `
      0 0 5px #00FFFF,
      0 0 10px ${glowCol},
      0 0 15px #00FF00,
      0 0 20px #FF00FF,
      0 0 30px #00FFFF
    `;
    style.fontWeight = 700;
    style.letterSpacing = "2px";
  }

  if (layer.textStyle && String(layer.textStyle) === "hologram") {
    style.color = "#0FF";
    style.textShadow = `
      0 0 10px #0FF,
      0 0 20px #0FF,
      -2px -2px 5px #FF00FF,
      2px 2px 5px #FF00FF
    `;
    style.fontWeight = 500;
    style.letterSpacing = "3px";
  }

  return (
    <div 
      style={{
        ...style,
        maxWidth: '100%',
        maxHeight: '100%',
        boxSizing: 'border-box',
      }} 
      key={`${layer.fontFamily}-${fontLoaded}`}
      className="w-full h-full overflow-hidden"
    >
      {layer.text}
    </div>
  );
}

/* ======================================================
   PATTERN
====================================================== */

function PatternRenderer({ layer }: { layer: PatternLayer }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [patternUrl, setPatternUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = Math.max(layer.scale ?? 10, 5);
      canvas.width = size * 2;
      canvas.height = size * 2;

      const color1 = layer.color1 || "#000000"; // foreground
      const color2 = layer.color2 || "#FFFFFF"; // background

      // Fill background (unless transparent)
      if (color2 !== "transparent") {
        ctx.fillStyle = color2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        // clear to transparent
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      ctx.fillStyle = color1;

      if (layer.patternType === "stripes") {
        for (let i = 0; i < canvas.width; i += size * 2) {
          if (color1 !== "transparent") ctx.fillRect(i, 0, size, canvas.height);
        }
      } else if (layer.patternType === "dots") {
        const dotSize = size / 3;
        if (color1 !== "transparent") {
          for (let x = dotSize; x < canvas.width; x += size) {
            for (let y = dotSize; y < canvas.height; y += size) {
              ctx.beginPath();
              ctx.arc(x, y, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (layer.patternType === "checkerboard") {
        if (color1 !== "transparent") {
          for (let x = 0; x < canvas.width; x += size) {
            for (let y = 0; y < canvas.height; y += size) {
              if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
                ctx.fillRect(x, y, size, size);
              }
            }
          }
        }
      } else if (layer.patternType === "grid") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 1;
        if (color1 !== "transparent") {
          for (let i = 0; i < canvas.width; i += size) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, canvas.height);
            ctx.stroke();
          }
          for (let i = 0; i < canvas.height; i += size) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(canvas.width, i);
            ctx.stroke();
          }
        }
      } else if (layer.patternType === "diagonal") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 1;
        if (color1 !== "transparent") {
          for (let i = -canvas.height; i < canvas.width; i += size * 1.5) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + canvas.height, canvas.height);
            ctx.stroke();
          }
        }
      } else if (layer.patternType === "waves") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 2;
        if (color1 !== "transparent") {
          for (let x = 0; x < canvas.width; x += size * 2) {
            ctx.beginPath();
            for (let i = 0; i < canvas.height; i++) {
              const y = (Math.sin((i + x) / (size / 2)) * (size / 2)) + (size / 2);
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x + i / (canvas.height / size), y);
            }
            ctx.stroke();
          }
        }
      } else if (layer.patternType === "hexagon") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 1;
        const hexSize = size / 2;
        if (color1 !== "transparent") {
          for (let x = 0; x < canvas.width; x += size * 1.5) {
            for (let y = 0; y < canvas.height; y += size * 1.5) {
              drawHexagon(ctx, x + hexSize, y + hexSize, hexSize);
            }
          }
        }
      } else if (layer.patternType === "triangle") {
        if (color1 !== "transparent") {
          ctx.fillStyle = color1;
          for (let x = 0; x < canvas.width; x += size) {
            for (let y = 0; y < canvas.height; y += size) {
              ctx.beginPath();
              ctx.moveTo(x + size / 2, y);
              ctx.lineTo(x + size, y + size);
              ctx.lineTo(x, y + size);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      } else if (layer.patternType === "crosshatch") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 1;
        if (color1 !== "transparent") {
          // Diagonal lines one way
          for (let i = -canvas.height; i < canvas.width; i += size) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + canvas.height, canvas.height);
            ctx.stroke();
          }
          // Diagonal lines other way
          for (let i = 0; i < canvas.width + canvas.height; i += size) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i - canvas.height, canvas.height);
            ctx.stroke();
          }
        }
      } else if (layer.patternType === "zigzag") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 2;
        if (color1 !== "transparent") {
          for (let y = 0; y < canvas.height; y += size) {
            ctx.beginPath();
            for (let x = 0; x <= canvas.width; x += size / 2) {
              const zy = y + (x / (size / 2) % 2 === 0 ? 0 : size / 2);
              if (x === 0) ctx.moveTo(x, zy);
              else ctx.lineTo(x, zy);
            }
            ctx.stroke();
          }
        }
      } else if (layer.patternType === "chevron") {
        ctx.strokeStyle = color1;
        ctx.lineWidth = 2;
        if (color1 !== "transparent") {
          for (let y = 0; y < canvas.height; y += size) {
            for (let x = 0; x < canvas.width; x += size) {
              ctx.beginPath();
              ctx.moveTo(x, y + size / 2);
              ctx.lineTo(x + size / 2, y);
              ctx.lineTo(x + size, y + size / 2);
              ctx.stroke();
            }
          }
        }
      } else if (layer.patternType === "polka") {
        const dotSize = size / 2;
        if (color1 !== "transparent") {
          for (let x = size / 2; x < canvas.width; x += size * 1.5) {
            for (let y = size / 2; y < canvas.height; y += size * 1.5) {
              ctx.beginPath();
              ctx.arc(x, y, dotSize, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (layer.patternType === "stars") {
        if (color1 !== "transparent") {
          for (let x = size; x < canvas.width; x += size * 2) {
            for (let y = size; y < canvas.height; y += size * 2) {
              drawStar(ctx, x, y, 5, size / 2, size / 4);
            }
          }
        }
      } else if (layer.patternType === "diamond") {
        if (color1 !== "transparent") {
          for (let x = 0; x < canvas.width; x += size) {
            for (let y = 0; y < canvas.height; y += size) {
              ctx.beginPath();
              ctx.moveTo(x + size / 2, y);
              ctx.lineTo(x + size, y + size / 2);
              ctx.lineTo(x + size / 2, y + size);
              ctx.lineTo(x, y + size / 2);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      } else if (layer.patternType === "vertical") {
        ctx.fillStyle = color1;
        if (color1 !== "transparent") {
          for (let i = 0; i < canvas.width; i += size * 2) {
            ctx.fillRect(i, 0, size / 2, canvas.height);
          }
        }
      } else if (layer.patternType === "horizontal") {
        ctx.fillStyle = color1;
        if (color1 !== "transparent") {
          for (let i = 0; i < canvas.height; i += size * 2) {
            ctx.fillRect(0, i, canvas.width, size / 2);
          }
        }
      }

      // Convert canvas to data URL
      const url = canvas.toDataURL("image/png");
      setPatternUrl(url);
    } catch (e) {
      console.error("Failed to generate pattern:", e);
    }
  }, [layer.patternType, layer.color1, layer.color2, layer.scale]);

  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    opacity: layer.opacity ?? 1,
    backgroundImage: patternUrl ? `url(${patternUrl})` : undefined,
    backgroundRepeat: "repeat",
    backgroundSize: layer.scale ? `${layer.scale}px ${layer.scale}px` : "auto",
    backgroundColor: layer.color2 === "transparent" ? "transparent" : layer.color2,
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <div style={style} />
    </>
  );
}

/**
 * Helper to draw hexagon on canvas
 */
function drawHexagon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Helper to draw star on canvas
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  points: number,
  outerRadius: number,
  innerRadius: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const sx = x + radius * Math.cos(angle);
    const sy = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();
}
