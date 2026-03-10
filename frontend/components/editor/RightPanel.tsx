"use client";

import { Side } from "@/types/editor";

/* ================= PROPS ================= */

type ImageWithView = { image: string; view?: string };

interface RightPanelProps {
  product: {
    id?: string;
    name?: string;
    images?: string[] | ImageWithView[];
  };
  selectedColor: string;
  activeSide: Side;
  setActiveSide: (side: Side) => void;
  layerCount?: number;
  selectedLayerId?: string | null;
  getPreviewImages?: () => Promise<Record<Side, string | null>>;
  availableSizes?: string[];
  availableColors?: Array<{ name: string; hex: string }>;
  variants?: Array<{
    id: string;
    color: string;
    size: string;
    price: number;
    stock: number;
  }>;
  onAddToCart?: (variantId: string, productName: string, selectedSize: string, selectedColor: string, price: number) => void;
  isGenerating?: boolean;
}

/* ================= CONSTANTS ================= */

const SIDES: Side[] = ["front", "back", "right", "left"];
const API_URL = "http://localhost:5000";

function toFullUrl(path: string): string {
  let p = String(path).replace(/\\/g, "/").trim();
  p = p.replace(/^[A-Za-z]:\//, "");
  if (p.startsWith("uploads/")) p = "/" + p;
  if (p.startsWith("http")) return p;
  if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/uploads/${p}`;
}

/* ================= IMAGE RESOLVER ================= */

function resolvePreviewImage(
  images: string[] | ImageWithView[] | undefined,
  _color: string,
  side: Side
): string | null {
  if (!images?.length) return null;

  const withView = images as ImageWithView[];
  const first = withView[0];
  const hasView = first && typeof first === "object" && "view" in first;

  if (hasView) {
    const sideUpper = side.toUpperCase();
    const match = withView.find(
      (img) => (img as ImageWithView).view?.toUpperCase() === sideUpper
    );
    if (match?.image) return toFullUrl(match.image);
    const order = ["front", "back", "right", "left"].indexOf(side);
    if (order >= 0 && withView[order]?.image) {
      return toFullUrl(withView[order].image);
    }
    if (withView[0]?.image) return toFullUrl(withView[0].image);
  }

  // Legacy: plain string array
  const path = typeof first === "string" ? first : (first as ImageWithView).image;
  return path ? toFullUrl(path) : null;
}

/* ================= COMPONENT ================= */

import { useState } from "react";

export default function RightPanel({
  product,
  selectedColor,
  activeSide,
  setActiveSide,
  layerCount = 0,
  selectedLayerId,
  getPreviewImages,
  availableSizes = ["XS", "S", "M", "L", "XL", "XXL"],
  availableColors = [],
  variants = [],
  onAddToCart,
  isGenerating = false,
}: RightPanelProps) {
  // State for selected size and color
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || "");
  const [selectedVariantColor, setSelectedVariantColor] = useState<string>(selectedColor);

  // Find matching variant based on selected size and color
  const selectedVariant = variants.find(
    v => v.size === selectedSize && v.color.toLowerCase() === selectedVariantColor.toLowerCase()
  );

  // Get product name for cart
  const productName = product.name || "Custom Design";
  const sideLabels: Record<Side, string> = {
    front: " Front",
    back: " Back",
    left: " Left",
    right: " Right",
  };

  const fallbackImg =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100%25' height='100%25' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='12'%3ENo Image%3C/text%3E%3C/svg%3E";

  const [showPreview, setShowPreview] = useState(false);
  const [previewImages, setPreviewImages] = useState<Record<Side, string | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
  });
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const handlePreview = async () => {
    setPreviewError(null);
    setLoadingPreview(true);
    setShowPreview(true);
    try {
      if (getPreviewImages) {
        console.log(" Starting preview capture...");
        const images = await getPreviewImages();
        console.log(" Preview capture complete:", images);

        // Show images regardless - user can see what captured and what didn't
        setPreviewImages(images);
      } else {
        throw new Error("Preview not available");
      }
    } catch (err: any) {
      console.error(" Preview error:", err);
      setPreviewError(err?.message || "Failed to generate preview");
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <>
      <aside className="w-full lg:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 p-3 lg:p-5 flex flex-row lg:flex-col justify-between h-full overflow-x-auto lg:overflow-y-auto">
        {/* TOP */}
        <div className="min-w-[200px] lg:min-w-0">
          <h3 className="hidden lg:block font-bold text-lg mb-1 text-gray-900">
            Product Details
          </h3>
          <p className="hidden lg:block text-xs text-gray-500 mb-4">
            Review your design details
          </p>

          <div className="hidden lg:block space-y-5 mb-4">
            {/* Size Selection */}
            <div>
              <p className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">Size</p>
              <div className="grid grid-cols-3 gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${selectedSize === size
                        ? "bg-gray-900 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <p className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">Color</p>
              {availableColors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color.name}
                      title={color.name}
                      onClick={() => setSelectedVariantColor(color.name)}
                      className={`w-9 h-9 rounded-full transition-all ${selectedVariantColor.toLowerCase() === color.name.toLowerCase()
                          ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                          : "hover:scale-105"
                        }`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">No colors available</p>
              )}
            </div>

            {/* Price & Stock Info */}
            {selectedVariant && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                    <p className="text-2xl font-bold text-gray-900">₹{selectedVariant.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Stock</p>
                    <p className={`text-sm font-medium ${selectedVariant.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                      {selectedVariant.stock > 0 ? `${selectedVariant.stock} available` : "Out of stock"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Design Info */}
            <div className="pt-4 border-t border-gray-100">
              <p className="font-semibold text-sm text-gray-700 mb-3 uppercase tracking-wide">Design Info</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Side</span>
                  <span className="font-medium text-gray-900 capitalize">{activeSide}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Color</span>
                  <span className="font-medium text-gray-900 capitalize">{selectedColor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Layers</span>
                  <span className="font-medium text-gray-900">{layerCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="hidden lg:block space-y-3 border-t border-gray-200 pt-4">
          <button
            onClick={() => {
              if (selectedVariant && onAddToCart) {
                onAddToCart(selectedVariant.id, productName, selectedSize, selectedVariantColor, selectedVariant.price);
              } else if (!selectedVariant) {
                alert("Please select a valid size and color combination");
              }
            }}
            disabled={!selectedVariant || selectedVariant.stock <= 0 || isGenerating}
            className={`w-full py-3 rounded-xl font-bold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-base ${selectedVariant && selectedVariant.stock > 0 && !isGenerating
                ? "bg-pink-600 hover:bg-pink-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            title={selectedVariant ? "Add this design to your cart" : "Select size and color first"}
          >
            {isGenerating ? (
              <>
                <span className="animate-spin">⟳</span>
                <span>Processing Design...</span>
              </>
            ) : (
              <>
                <span>🛒</span>
                {selectedVariant
                  ? selectedVariant.stock > 0
                    ? `Add to Cart - ₹${selectedVariant.price}`
                    : "Out of Stock"
                  : "Select Size & Color"
                }
              </>
            )}
          </button>

          <button
            className="w-full border-2 border-teal-500 bg-teal-50 hover:bg-teal-100 py-3 rounded-xl text-sm font-bold text-teal-700 hover:border-teal-600 transition-all duration-200 transform active:scale-95 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            onClick={handlePreview}
            disabled={loadingPreview}
          >
            <span></span> Preview Mockup
            {loadingPreview && <span className="animate-spin">⟳</span>}
          </button>

          <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
            <p>
              Press{" "}
              <kbd className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono border border-gray-300">
                Delete
              </kbd>{" "}
              to remove layer
            </p>
          </div>
        </div>
      </aside>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200 text-2xl font-bold"
              onClick={() => {
                setShowPreview(false);
                setPreviewError(null);
                setLoadingPreview(false);
              }}
              aria-label="Close"
              title="Close preview"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Preview Mockup</h2>
              <p className="text-gray-500">Your edits applied to each side — use Download to save images</p>
            </div>

            {/* Loading State */}
            {loadingPreview && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-teal-600 mb-4" aria-hidden />
                <p className="text-gray-600 font-medium">Capturing your edits on each side…</p>
                <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
              </div>
            )}

            {/* Error State */}
            {previewError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-red-700 text-center">
                <p className="font-semibold text-lg mb-1">⚠️ Preview Failed</p>
                <p className="text-sm">{previewError}</p>
              </div>
            )}

            {/* Preview Grid */}
            {!loadingPreview && !previewError && (
              <div className="space-y-6">
                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(["front", "back", "right", "left"] as Side[]).map((side) => (
                    <div
                      key={side}
                      className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-4 hover:border-teal-500 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Side Label + Download */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-gray-900 capitalize text-lg">
                          {side === "front" && ""}
                          {side === "back" && ""}
                          {side === "left" && ""}
                          {side === "right" && ""}
                          {" "}{side}
                        </span>
                        <div className="flex items-center gap-2">
                          {previewImages[side] && (
                            <>
                              <span className="text-xs bg-green-100 text-green-700 font-semibold px-3 py-1 rounded-full">
                                ✓ Designed
                              </span>
                              <button
                                type="button"
                                className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-800 font-semibold px-2 py-1 rounded"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = previewImages[side]!;
                                  link.download = `mockup-${side}-${Date.now()}.png`;
                                  link.click();
                                }}
                              >
                                Download
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Image Container */}
                      <div className="relative bg-white rounded-lg border border-gray-300 overflow-hidden aspect-square flex items-center justify-center min-h-64">
                        {previewImages[side] ? (
                          <img
                            src={previewImages[side]!}
                            alt={`${side} side design`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3EFailed to load%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 py-16">
                            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium">Not designed</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-6">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Designed Sides:</span> {
                      Object.entries(previewImages)
                        .filter(([_, img]) => img !== null)
                        .map(([side]) => side.charAt(0).toUpperCase() + side.slice(1))
                        .join(", ") || "None"
                    }
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    onClick={() => {
                      const timestamp = Date.now();
                      const entries = (Object.entries(previewImages) as [Side, string | null][]).filter(
                        (entry): entry is [Side, string] => entry[1] != null
                      );
                      if (entries.length === 0) return;
                      entries.forEach(([side, img], index) => {
                        setTimeout(() => {
                          const link = document.createElement("a");
                          link.href = img;
                          link.download = `mockup-${side}-${timestamp}.png`;
                          link.click();
                        }, index * 300);
                      });
                    }}
                    disabled={!Object.values(previewImages).some(Boolean)}
                  >
                    <span>⬇</span> Download Preview
                    <span>⬇️</span> Download all sides
                  </button>
                  <button
                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg font-semibold transition-all duration-200 transform active:scale-95"
                    onClick={() => setShowPreview(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
