
"use client";
import React from "react";

import { useCallback, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import EditorCanvas from "./EditorCanvas";
import html2canvas from "html2canvas-pro";
import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";
import IconSidebar from "./IconSidebar";

import {
  EditorLayer,
  Side,
  TextLayer,
  ImageLayer,
  PatternLayer,
} from "@/types/editor";

import { TextOptions } from "@/types/editor-options";
import type { ProductVariantImage } from "@/types/product";
import { generateImage } from "@/lib/api/ai";
import { useCart } from "@/lib/cart";
import { PDFGenerator } from "@/lib/pdf-generator";

type ToolTab = "products" | "designs" | "text" | "upload" | "ai" | "stickers";

/* ================= HELPERS ================= */

// Convert relative URLs to absolute
function toFullUrl(path: string): string {
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads/")) return `http://localhost:5000${path}`;
  if (path.startsWith("/")) return `http://localhost:5000${path}`;
  return `http://localhost:5000/uploads/${path}`;
}

// Pass through images with view so editor can show correct image per side
function buildEditorImages(
  images: ProductVariantImage[] = []
): ProductVariantImage[] {
  return images.filter(i => !!i.image);
}

/* ================= COMPONENT ================= */

export default function EditorLayout({
  product,
  variant,
}: {
  product: {
    id: string;
    type?: string;
    variants?: Array<{
      id: string;
      color: string;
      size: string;
      price: number;
      stock: number;
      images?: ProductVariantImage[];
    }>;
  };
  variant: {
    id: string;
    color?: string;
    images?: ProductVariantImage[];
  };
}) {
  const canvasRef = React.useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<EditorLayer[]>([]);
  const [activeSide, setActiveSide] = useState<Side>("front");
  const [selectedLayerId, setSelectedLayerId] =
    useState<string | null>(null);
  const [isCapturingPreview, setCapturingPreview] = useState(false);
  const [activeToolTab, setActiveToolTab] = useState<ToolTab>("text");
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [mobilePanelTab, setMobilePanelTab] = useState<
    "text" | "image" | "graphics" | "stickers" | "ai"
  >("text");

  // Mobile tab options
  const mobileTabs = ["text", "image", "graphics", "stickers", "ai"] as const;

  const selectedColor = variant.color ?? "default";
  const { addToCart } = useCart();

  const editorImages = useMemo(
    () => buildEditorImages(variant.images),
    [variant.images]
  );

  // Extract available sizes and colors from product variants
  const { availableSizes, availableColors } = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return {
        availableSizes: ["XS", "S", "M", "L", "XL", "XXL"],
        availableColors: []
      };
    }

    const sizes = [...new Set(product.variants.map(v => v.size))].sort();
    const colors = [...new Map(product.variants.map(v => [v.color.toLowerCase(), {
      name: v.color,
      hex: getColorHex(v.color)
    }])).values()];

    return { availableSizes: sizes, availableColors: colors };
  }, [product.variants]);

  // Helper to get hex color from color name
  function getColorHex(colorName: string): string {
    const colorMap: Record<string, string> = {
      white: "#FFFFFF",
      black: "#000000",
      gray: "#6B7280",
      red: "#EF4444",
      blue: "#3B82F6",
      green: "#10B981",
      yellow: "#F59E0B",
      purple: "#8B5CF6",
      pink: "#EC4899",
      orange: "#F97316",
      navy: "#1E3A8A",
      brown: "#92400E",
      beige: "#F5F5DC",
      cream: "#FFFDD0",
      offwhite: "#F9FAFB",
      maroon: "#7F1D1D",
      teal: "#14B8A6",
      olive: "#65A30D",
    };
    return colorMap[colorName.toLowerCase()] || "#CCCCCC";
  }

  const selectedLayer = useMemo(
    () => layers.find(l => l.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  const lastPatternId = useMemo(() => {
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i].type === "pattern") return layers[i].id;
    }
    return null;
  }, [layers]);

  const nextZIndex = useMemo(
    () =>
      layers.length
        ? Math.max(...layers.map(l => l.zIndex)) + 1
        : 1,
    [layers]
  );

  /* ================= FACTORIES ================= */

  const createTextLayer = (
    text: string,
    opts: TextOptions
  ): TextLayer => ({
    id: nanoid(),
    type: "text",
    side: activeSide,
    text,
    textAlign: "center",
    fontSize: opts.fontSize,
    fontFamily: opts.fontFamily,
    fontWeight: opts.fontWeight,
    color: opts.color,
    letterSpacing: opts.letterSpacing,
    lineHeight: opts.lineHeight,
    textStyle: opts.textStyle,
    curve: opts.curve,
    x: 40,
    y: 40,
    width: 240,
    height: 80,
    rotation: 0,
    opacity: opts.opacity,
    locked: false,
    visible: true,
    zIndex: nextZIndex,
  });

  const createImageLayer = (src: string): ImageLayer => ({
    id: nanoid(),
    type: "image",
    side: activeSide,
    // Preserve data URLs (generated patterns / AI images) as-is, otherwise
    // convert relative paths to full URLs for server-hosted images.
    src: src.startsWith("data:") ? src : toFullUrl(src),
    x: 60,
    y: 60,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 1,
    locked: false,
    visible: true,
    zIndex: nextZIndex,
  });

  const createPatternLayer = (opts: {
    patternType: PatternLayer["patternType"];
    color1: string;
    color2: string;
    scale: number;
    rotation: number;
    opacity?: number;
  }): PatternLayer => ({
    id: nanoid(),
    type: "pattern",
    side: activeSide,
    patternType: opts.patternType,
    color1: opts.color1,
    color2: opts.color2,
    scale: opts.scale,
    rotation: opts.rotation,
    x: 60,
    y: 60,
    width: 200,
    height: 200,
    opacity: opts.opacity ?? 1,
    locked: false,
    visible: true,
    zIndex: nextZIndex,
  });

  /* ================= ADD ================= */

  const onAddText = useCallback(
    (text: string, opts: TextOptions) => {
      const layer = createTextLayer(text, opts);
      setLayers(prev => [...prev, layer]);
      setSelectedLayerId(layer.id);
    },
    [activeSide, nextZIndex]
  );

  const onAddImage = useCallback(
    (src: string) => {
      const layer = createImageLayer(src);
      setLayers(prev => [...prev, layer]);
      setSelectedLayerId(layer.id);
    },
    [activeSide, nextZIndex]
  );

  const onAddPattern = useCallback(
    (opts: {
      patternType: PatternLayer["patternType"];
      color1: string;
      color2: string;
      scale: number;
      rotation: number;
      opacity?: number;
    }) => {
      const layer = createPatternLayer(opts);
      setLayers(prev => [...prev, layer]);
      setSelectedLayerId(layer.id);
    },
    [activeSide, nextZIndex]
  );

  /* ================= AI GENERATE ================= */

  const onGenerateAIImage = useCallback(async (prompt: string): Promise<string> => {
    const url = await generateImage(prompt);
    return url;
  }, []);

  /* ================= UPDATE ================= */

  const updateLayer = <
    T extends EditorLayer["type"]
  >(
    id: string,
    type: T,
    patch: Omit<
      Partial<Extract<EditorLayer, { type: T }>>,
      "type"
    >
  ) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id && layer.type === type
          ? { ...layer, ...patch }
          : layer
      )
    );
  };

  const onUpdateText = useCallback(
    (patch: Partial<TextLayer>) => {
      if (!selectedLayerId) return;

      setLayers(prev =>
        prev.map(l =>
          l.id === selectedLayerId && l.type === "text"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    [selectedLayerId]
  );

  const onUpdateImage = useCallback(
    (patch: Partial<ImageLayer>) => {
      if (!selectedLayerId) return;

      setLayers(prev =>
        prev.map(l =>
          l.id === selectedLayerId && l.type === "image"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    [selectedLayerId]
  );

  const onUpdatePattern = useCallback(
    (patch: Partial<PatternLayer>) => {
      if (!selectedLayerId) return;

      setLayers(prev =>
        prev.map(l =>
          l.id === selectedLayerId && l.type === "pattern"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    [selectedLayerId]
  );

  const onUpdatePatternById = useCallback(
    (id: string, patch: Partial<PatternLayer>) => {
      setLayers(prev =>
        prev.map(l =>
          l.id === id && l.type === "pattern"
            ? { ...l, ...patch }
            : l
        )
      );
    },
    []
  );

  /* ================= DELETE ================= */

  const deleteLayer = useCallback((id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedLayerId(null);
  }, []);

  /* ================= DUPLICATE ================= */

  const duplicateLayer = useCallback((id: string) => {
    const layerToDuplicate = layers.find(l => l.id === id);
    if (!layerToDuplicate) return;

    const duplicated: EditorLayer = {
      ...layerToDuplicate,
      id: nanoid(),
      x: (layerToDuplicate.x ?? 0) + 20,
      y: (layerToDuplicate.y ?? 0) + 20,
      zIndex: nextZIndex,
    };

    setLayers(prev => [...prev, duplicated]);
    setSelectedLayerId(duplicated.id);
  }, [layers, nextZIndex]);

  /* ================= ROTATE ================= */

  const rotateLayer = useCallback((id: string, angle: number) => {
    setLayers(prev =>
      prev.map(l =>
        l.id === id
          ? { ...l, rotation: ((l.rotation || 0) + angle + 360) % 360 }
          : l
      )
    );
  }, []);

  /* ================= PREVIEW ================= */

  // Function to capture all sides as images
  const getPreviewImages = async (): Promise<Record<Side, string | null>> => {
    const sides: Side[] = ["front", "back", "right", "left"];
    const previews: Record<Side, string | null> = {
      front: null,
      back: null,
      left: null,
      right: null,
    };

    setCapturingPreview(true);
    await new Promise((r) => setTimeout(r, 250));

    const waitForPaint = () =>
      new Promise<void>((r) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => r());
        });
      });

    const waitForImages = async (element: HTMLElement | null, timeout = 3000) => {
      if (!element) return;
      const images = element.querySelectorAll("img");
      if (!images.length) return;
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
                setTimeout(resolve, timeout);
              }
            })
        )
      );
    };

    let lastError: string | null = null;

    try {
      for (const side of sides) {
        setActiveSide(side);
        await waitForPaint();
        await new Promise((r) => setTimeout(r, 400));
        await waitForImages(canvasRef.current);

        if (!canvasRef.current) continue;

        try {
          const element = canvasRef.current;

          // Use html2canvas-pro for better rendering
          const html2canvas = (await import('html2canvas-pro')).default;
          const canvas = await html2canvas(element, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            imageTimeout: 8000,
            logging: false,
          });

          // Capture full canvas without clipping
          const dataUrl = canvas.toDataURL("image/png");
          previews[side] = dataUrl;
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          previews[side] = null;
        }
      }
    } finally {
      setCapturingPreview(false);
      setActiveSide("front");
    }

    if (lastError && !Object.values(previews).some(Boolean)) {
      throw new Error(`Preview failed: ${lastError}`);
    }
    return previews;
  };

  // Map ToolTab to LeftPanel's Tab
  const mapToolToTab = (tool: ToolTab): "text" | "image" | "graphics" | "stickers" | "ai" => {
    switch (tool) {
      case "text": return "text";
      case "upload": return "image";
      case "ai": return "ai";
      case "designs": return "graphics";
      case "stickers": return "stickers";
      default: return "text";
    }
  };

  const handleToolTabChange = (tab: ToolTab) => {
    setActiveToolTab(tab);
    if (tab === "products") {
      // Could open product selector modal
      return;
    }
    setIsToolsPanelOpen(true);
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#f4f5f7] overflow-hidden relative">
      {/* Mobile Header */}
      <div className="lg:hidden h-14 bg-white border-b flex items-center justify-between px-4 shrink-0">
        <h1 className="font-semibold text-lg">Design Studio</h1>
        <button
          onClick={() => setIsToolsPanelOpen(!isToolsPanelOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Icon Sidebar - Hidden on mobile, shown on lg */}
      <div className="hidden lg:block">
        <IconSidebar
          activeTab={activeToolTab}
          onTabChange={handleToolTabChange}
        />
      </div>

      {/* Mobile Tools Panel Overlay */}
      {isToolsPanelOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsToolsPanelOpen(false)}
          />

          {/* Mobile Tools Panel */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-[320px] max-w-full bg-white z-50 shadow-xl flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-base">Tools</h2>
              <button
                onClick={() => setIsToolsPanelOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close tools"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Icon Menu */}
            <div className="p-3 grid grid-cols-5 gap-2 border-b">
              {mobileTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setMobilePanelTab(tab);
                  }}
                  className={`py-2 px-1 rounded-lg text-xs font-medium capitalize text-center ${mobilePanelTab === tab ? "bg-indigo-100 text-indigo-700" : "bg-gray-50 text-gray-700"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Mobile Tools Content */}
            <div className="flex-1 min-h-0">
              <LeftPanel
                selectedLayer={selectedLayer}
                onAddText={onAddText}
                onUpdateText={onUpdateText}
                onAddImage={onAddImage}
                onUpdateImage={onUpdateImage}
                onAddPattern={onAddPattern}
                onUpdatePattern={onUpdatePattern}
                lastPatternId={lastPatternId}
                onUpdatePatternById={onUpdatePatternById}
                onGenerateAIImage={onGenerateAIImage}
                initialTab={mobilePanelTab}
                onClose={() => setIsToolsPanelOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      {/* Desktop Tools Panel */}
      {isToolsPanelOpen && activeToolTab !== "products" && (
        <div className="hidden lg:block">
          <LeftPanel
            selectedLayer={selectedLayer}
            onAddText={onAddText}
            onUpdateText={onUpdateText}
            onAddImage={onAddImage}
            onUpdateImage={onUpdateImage}
            onAddPattern={onAddPattern}
            onUpdatePattern={onUpdatePattern}
            lastPatternId={lastPatternId}
            onUpdatePatternById={onUpdatePatternById}
            onGenerateAIImage={onGenerateAIImage}
            initialTab={mapToolToTab(activeToolTab)}
            onClose={() => setIsToolsPanelOpen(false)}
          />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {/* Top Bar - Hidden on mobile, also hidden in fullscreen */}
        <div className={`hidden lg:flex h-14 bg-white border-b items-center justify-end px-4 shrink-0 ${isFullscreen ? 'lg:hidden' : ''}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                if (canvasRef.current) {
                  try {
                    const html2canvas = (await import('html2canvas-pro')).default;
                    const canvas = await html2canvas(canvasRef.current, {
                      backgroundColor: null,
                      scale: 2,
                      useCORS: true,
                    });
                    const link = document.createElement('a');
                    link.download = `design-${activeSide}-${Date.now()}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  } catch (err) {
                    console.error('Export failed:', err);
                    alert('Failed to export design. Please try again.');
                  }
                }
              }}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="text-sm">Save</span>
            </button>
            <button className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-sm">Share</span>
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="text-sm">{isFullscreen ? "Exit Fullscreen" : "Full screen"}</span>
            </button>
          </div>
        </div>

        {/* Canvas & Right Panel Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-auto lg:overflow-hidden relative">
          {/* Exit Fullscreen Button - Only visible in fullscreen */}
          {isFullscreen && (
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-50 bg-black text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Exit Fullscreen
            </button>
          )}

          {/* Canvas - Full width on mobile, flex-1 on desktop */}
          <div className={`flex-1 flex flex-col min-h-0 ${isFullscreen ? 'h-full' : ''}`}>
            <EditorCanvas
              ref={canvasRef}
              product={{
                type: product.type,
                images: editorImages,
                imagesWithView: editorImages,
              }}
              side={activeSide}
              selectedColor={selectedColor}
              layers={layers}
              updateLayer={updateLayer}
              deleteLayer={deleteLayer}
              duplicateLayer={duplicateLayer}
              rotateLayer={rotateLayer}
              selectedLayerId={selectedLayerId}
              setSelectedLayerId={setSelectedLayerId}
              captureMode={isCapturingPreview}
              availableSides={["front", "back", "right", "left"]}
              onSideChange={setActiveSide}
              hideSideSelector={isFullscreen}
              enableZoom={isFullscreen}
            />
          </div>

          {/* Right Panel - Bottom sheet on mobile, sidebar on desktop - Hidden in fullscreen */}
          {!isFullscreen && (
            <div className="lg:w-80 h-32 lg:h-auto shrink-0">
              <RightPanel
                product={{ id: product.id, name: (product as any).name, images: editorImages }}
                selectedColor={selectedColor}
                activeSide={activeSide}
                setActiveSide={setActiveSide}
                layerCount={layers.length}
                selectedLayerId={selectedLayerId}
                getPreviewImages={getPreviewImages}
                availableSizes={availableSizes}
                availableColors={availableColors}
                variants={product.variants}
                isGenerating={isGeneratingPdf}
                onAddToCart={async (variantId, productName, selectedSize, selectedColor, price) => {
                  // Find the variant details
                  const selectedVariant = product.variants?.find(v => v.id === variantId);

                  if (!selectedVariant) {
                    alert("Error: Variant not found");
                    return;
                  }

                  setIsGeneratingPdf(true);
                  try {
                    // Capture preview images
                    let previewImages = {};
                    if (getPreviewImages) {
                      try {
                        previewImages = await getPreviewImages();
                      } catch (error) {
                        console.error("Failed to capture preview images:", error);
                      }
                    }

                    // Get design elements (this would come from your editor state)
                    const designElements: Array<{ type: string, content: string }> = [];

                    // Get sticker and graphic URLs (this would come from your editor state)
                    const stickerUrls: string[] = [];
                    const graphicUrls: string[] = [];

                    // Get AI generated images (this would come from your AI generation)
                    const aiGeneratedImages: string[] = [];

                    // Generate PDF preview with full layer detail
                    let pdfUrl = "";
                    try {
                      console.log("Generating PDF preview...");
                      const pdfBlob = await PDFGenerator.generatePreviewMockup({
                        productId: product.id,
                        productName: productName,
                        previewImages: previewImages,
                        layers: layers, // pass real editor layers with all design specs
                      });

                      // Upload the PDF blob to get the URL
                      pdfUrl = await PDFGenerator.uploadPdf(pdfBlob, `mockup-${product.id}-${Date.now()}.pdf`);
                      console.log("Uploaded PDF successfully:", pdfUrl);
                    } catch (error) {
                      console.error("Failed to generate PDF:", error);
                      alert(`Error generating or uploading PDF mockup: ${error instanceof Error ? error.message : String(error)}`);
                    }

                    // Add to cart with all design information
                    addToCart({
                      productId: product.id,
                      variantId: variantId,
                      quantity: 1,
                      price: price,
                      name: productName,
                      size: selectedSize,
                      color: selectedColor,
                      imageUrl: selectedVariant.images?.[0]?.image || "/placeholder.png",
                      frontName: designElements.find(e => e.type === 'text')?.content,
                      stickerUrls: stickerUrls,
                      graphicUrls: graphicUrls,
                      aiGeneratedImages: aiGeneratedImages,
                      pdfUrl: pdfUrl,
                      mockupImages: previewImages,
                    });

                    // Redirect to checkout page
                    window.location.href = "/checkout";
                  } finally {
                    setIsGeneratingPdf(false);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
