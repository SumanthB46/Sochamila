"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/types/product";
import api from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";
import { useCart } from "@/lib/cart";
import { Heart, ShoppingBag } from "lucide-react";

/* ======================================================
   CONFIG
====================================================== */

const API_URL = "http://localhost:5000";

/* IMAGE URL HELPER */
const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
  if (!imagePath) return undefined;
  
  let p = String(imagePath).replace(/\\/g, "/").trim();
  p = p.replace(/^[A-Za-z]:\//, "");
  if (p.startsWith("uploads/")) p = "/" + p;
  
  if (p.startsWith("http")) return p;
  if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/uploads/${p}`;
};

/* ======================================================
   COMPONENT
====================================================== */

export default function ProductClient({
  product,
}: {
  product: Product;
}) {
  const router = useRouter();
  const variants = product.variants ?? [];

  useEffect(() => {
    console.log('[ProductClient] Product loaded:', {
      id: product.id,
      name: product.name,
      variantCount: variants.length,
      variants: variants.slice(0, 3).map(v => ({
        color: v.color,
        size: v.size,
        imageCount: v.images?.length || 0,
        firstImage: v.images?.[0]?.image
      }))
    });
  }, [product, variants]);

  /* ================= COLORS ================= */

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map(v => v.color.toLowerCase())
        )
      ),
    [variants]
  );

  const [selectedColor, setSelectedColor] =
    useState<string | null>(null);

  useEffect(() => {
    if (!selectedColor && colors.length) {
      setSelectedColor(colors[0]);
    }
  }, [colors, selectedColor]);

  /* ================= SIZES ================= */

  const sizes = useMemo(() => {
    if (!selectedColor) return [];
    return variants
      .filter(v => v.color.toLowerCase() === selectedColor)
      .map(v => v.size);
  }, [variants, selectedColor]);

  const [selectedSize, setSelectedSize] =
    useState<string | null>(null);

  /* ================= VARIANT ================= */

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find(
      v =>
        v.color.toLowerCase() === selectedColor &&
        v.size === selectedSize
    );
  }, [variants, selectedColor, selectedSize]);

  /* ================= IMAGES ================= */

  const images = useMemo(() => {
    if (selectedVariant?.images?.length) {
      return selectedVariant.images;
    }

    if (!selectedColor) return [];

    return (
      variants.find(
        v => v.color.toLowerCase() === selectedColor
      )?.images ?? []
    );
  }, [variants, selectedVariant, selectedColor]);

  const [activeImage, setActiveImage] =
    useState<string | null>(null);

  const [imageRotation, setImageRotation] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [imageLoading, setImageLoading] = useState<Set<string>>(new Set());
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Navigation functions for zoom modal
  const navigateZoomImage = (direction: 'prev' | 'next') => {
    if (!zoomImage || images.length <= 1) return;
    const currentIndex = images.findIndex(img => img.image === zoomImage);
    if (currentIndex === -1) return;

    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    }
    setZoomImage(images[newIndex].image);
  };



  // Keyboard navigation for zoom modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!zoomImage) return;

      if (e.key === 'Escape') {
        setZoomImage(null);
      } else if (e.key === 'ArrowLeft') {
        navigateZoomImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateZoomImage('next');
      }
    };

    if (zoomImage) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [zoomImage, images]);

  const handleImageError = (imagePath: string) => {
    setFailedImages(prev => new Set(prev).add(imagePath));
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imagePath);
      return newSet;
    });
    console.error('[ProductClient] Image failed to load:', imagePath, {
      normalizedUrl: getImageUrl(imagePath),
      timestamp: new Date().toISOString()
    });
  };

  const handleImageLoad = (imagePath: string) => {
    setImageLoading(prev => {
      const newSet = new Set(prev);
      newSet.delete(imagePath);
      return newSet;
    });
  };

  const handleImageLoadStart = (imagePath: string) => {
    setImageLoading(prev => new Set(prev).add(imagePath));
  };

  useEffect(() => {
    if (images.length) {
      setActiveImage(images[0].image);
      setImageRotation(0);
      setFailedImages(new Set());
      setImageLoading(new Set());
      setZoomImage(null);

      console.log('[ProductClient] Images for selected variant:', {
        selectedColor,
        selectedSize,
        imageCount: images.length,
        images: images.map(img => ({
          original: img.image,
          normalized: getImageUrl(img.image)
        }))
      });
    } else {
      setActiveImage(null);
      setImageRotation(0);
      setZoomImage(null);
      console.log('[ProductClient] No images for variant:', {
        selectedColor,
        selectedSize,
        allVariants: product.variants.map(v => ({
          color: v.color,
          size: v.size,
          imageCount: v.images?.length || 0
        }))
      });
    }
  }, [images]);

  // Description toggle for long product descriptions
  const [showFullDescription, setShowFullDescription] = useState(false);
  const MAX_DESC_LENGTH = 300;

  /* ================= QUANTITY ================= */

  const [qty, setQty] = useState(1);

  /* ================= PRICE ================= */

  const unitPrice =
    selectedVariant?.price ??
    product.minPrice ??
    0;

  const totalPrice = unitPrice * qty;

  /* ================= CTA ================= */

  const { user, loading: authLoading } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  const handleCreate = () => {
    if (!selectedVariant) return;

    router.push(
      `/editor?product=${product.id}&variant=${selectedVariant.id}`
    );
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    try {
      setAddingToCart(true);

      // Add item to cart context
      addToCart({
        productId: product.id,
        variantId: selectedVariant.id,
        quantity: qty,
        price: selectedVariant.price || 0,
        name: product.name,
        size: selectedVariant.size,
        color: selectedVariant.color,
        imageUrl: getImageUrl(selectedVariant.images?.[0]?.image),
      });

      // Show success message or navigate to checkout
      // For now, we'll just add to cart and stay on the page
      // You could add a toast notification here
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Error adding to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-12 md:h-[600px]">

        {/* LEFT - IMAGE GALLERY */}
        <div className="flex gap-4 sticky top-12 h-fit">
          {/* THUMBNAILS */}
          <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto">
            {images.length > 0 ? (
              images.map((img, i) => {
                const imageUrl = getImageUrl(img.image);
                const isLoading = imageLoading.has(img.image);
                const hasFailed = failedImages.has(img.image);
                const viewLabel = img.view ? img.view.charAt(0).toUpperCase() + img.view.slice(1).toLowerCase() : `View ${i + 1}`;
                const altText = `${product.name} - ${selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Product'} - ${viewLabel}`;

                return (
                  <div key={i} className="relative group">
                    <button
                      onClick={() => {
                        setActiveImage(img.image);
                        setZoomImage(null);
                      }}
                      className={`border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                        activeImage === img.image
                          ? "ring-2 ring-teal-600 border-teal-600 shadow-lg"
                          : "border-gray-300"
                      }`}
                      title={`${viewLabel} view - Click to view details`}
                    >
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!hasFailed ? (
                        <img
                          src={imageUrl || undefined}
                          className={`w-24 h-24 object-cover transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                          alt={altText}
                          onLoad={() => handleImageLoad(img.image)}
                          onLoadStart={() => handleImageLoadStart(img.image)}
                          onError={() => handleImageError(img.image)}
                        />
                      ) : (
                        <div className="w-24 h-24 bg-gray-200 flex items-center justify-center">
                          <div className="text-xs text-gray-500 text-center p-1">
                            Image<br/>Failed
                          </div>
                        </div>
                      )}
                
                    </button>
                
                    {/* View Label */}
                    <div className="text-xs text-gray-600 text-center mt-1 font-medium">
                      {viewLabel}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs text-center">
                No images
              </div>
            )}


          </div>

          {/* MAIN IMAGE */}
          <div className="flex-1 bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-lg h-[500px] relative">
            {activeImage ? (
              <>
                {(() => {
                  const activeImageData = images.find(img => img.image === activeImage);
                  const imageUrl = getImageUrl(activeImage);
                  const isLoading = imageLoading.has(activeImage);
                  const hasFailed = failedImages.has(activeImage);
                  const viewLabel = activeImageData?.view ? activeImageData.view.charAt(0).toUpperCase() + activeImageData.view.slice(1).toLowerCase() : 'Product';
                  const altText = `${product.name} - ${selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Product'} - ${viewLabel} view`;

                  return (
                    <div className="relative w-full h-full flex items-center justify-center group cursor-zoom-in"
                         onClick={() => setZoomImage(activeImage)}>
                      {isLoading && (
                        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
                          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      {!hasFailed ? (
                        <img
                          src={imageUrl || undefined}
                          className={`max-h-[380px] max-w-full object-contain p-4 transition-all duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} group-hover:scale-105`}
                          alt={altText}
                          onLoad={() => handleImageLoad(activeImage)}
                          onLoadStart={() => handleImageLoadStart(activeImage)}
                          onError={() => handleImageError(activeImage)}
                        />
                      ) : (
                        <div className="text-center text-gray-500 p-8">
                          <div className="text-6xl mb-4">📷</div>
                          <div className="text-lg font-medium">Image Failed to Load</div>
                          <div className="text-sm text-gray-400 mt-2">Please try refreshing the page</div>
                        </div>
                      )}

                      {/* Resolution Badge */}
                      {activeImageData && (
                        <>
                          <div className="absolute top-4 left-4">
                            <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                              Image Details
                            </div>
                          </div>

                          
                        </>
                      )}



                      {/* View Label */}
                      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-md">
                        {viewLabel} View
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <div className="text-center text-gray-500">
                <div className="text-5xl mb-3">📷</div>
                <div className="text-lg">Select a variant to view images</div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - PRODUCT INFO */}
        <div className="space-y-4">
          {/* TITLE & PRICE */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="text-4xl font-bold text-teal-600 mb-2">
              ₹{totalPrice.toLocaleString()}
            </div>
            {qty > 1 && (
              <div className="text-sm text-gray-600">
                ₹{unitPrice.toLocaleString()} × {qty}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Product Description</h3>
            <div className="text-sm text-gray-700 leading-relaxed">
              {product.description ? (
                <div className={showFullDescription ? '' : 'line-clamp-3'}>
                  {product.description}
                </div>
              ) : (
                <p className="text-gray-500 italic">No description available for this product.</p>
              )}
              {product.description && product.description.length > MAX_DESC_LENGTH && (
                <button 
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="mt-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
                >
                  {showFullDescription ? 'Show Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>

          {/* QUANTITY */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-semibold text-gray-900 mb-1">
              Quantity
            </p>
            <div className="flex gap-4 items-center">
              <button
                onClick={() =>
                  setQty(q => Math.max(1, q - 1))
                }
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
              >
                −
              </button>
              <span className="w-12 text-center text-lg font-bold text-gray-900">
                {qty}
              </span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center border-2 border-gray-300 rounded-lg font-bold text-lg hover:border-teal-600 hover:bg-teal-50 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* COLOR SELECTION */}
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="font-semibold text-gray-900 mb-1">
              Color: <span className="capitalize text-teal-600">{selectedColor || 'Select'}</span>
            </p>
            <div className="flex gap-3 flex-wrap">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(null);
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 transform hover:scale-110 ${
                    selectedColor === color
                      ? "ring-4 ring-teal-400 border-teal-600"
                      : "border-gray-300 hover:border-teal-500"
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* SIZE SELECTION */}
          <div className="bg-gray-50 rounded-xl p-2">
            <p className="font-semibold text-gray-900 mb-1">
              Size: <span className="text-teal-600">{selectedSize || 'Select'}</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-5 py-2.5 border-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                    selectedSize === size
                      ? "bg-linear-to-r from-teal-600 to-teal-500 text-white border-teal-700 shadow-md"
                      : "border-gray-300 text-gray-700 hover:border-teal-500 hover:bg-gray-100"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* CTA BUTTONS */}
          <div className={`grid gap-3 ${user ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}>
            {/* CREATE NOW BUTTON */}
            <button
              disabled={!selectedVariant}
              onClick={handleCreate}
              className={`py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg ${
                selectedVariant
                  ? "bg-linear-to-r from-teal-600 to-teal-500 text-white hover:from-teal-700 hover:to-teal-600 hover:shadow-xl"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {selectedVariant ? " Create Now" : "Select Size"}
            </button>

            {/* CART/CHECKOUT BUTTONS - Only show if size selected */}
            {selectedVariant && (
              <>
                {user ? (
                  // Logged in: Show only Checkout button
                  <button
                    disabled={addingToCart}
                    onClick={handleAddToCart}
                    className="py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl disabled:opacity-60"
                  >
                    {addingToCart ? (
                      <span>⏳ Adding...</span>
                    ) : (
                      <span> Add to Cart</span>
                    )}
                  </button>
                ) : (
                  // Not logged in: Show both Login and Checkout buttons
                  <>
                    <button
                      onClick={() => router.push("/login")}
                      className="py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg bg-linear-to-r from-gray-600 to-gray-500 text-white hover:from-gray-700 hover:to-gray-600 hover:shadow-xl"
                    >
                      <span> Login</span>
                    </button>
                    <button
                      onClick={handleAddToCart}
                      className="py-4 rounded-xl text-lg font-bold transition-all duration-200 transform active:scale-95 shadow-lg bg-linear-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-xl"
                    >
                      <span> Add to Cart</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>

        </div>
               
        
        
               
              
      </div>
      <div className="border-t border-gray-200 my-8"></div>

          {/* POLICIES AND RELATED PRODUCTS SECTION */}
          <div className="space-y-6">
            {/* SHIPPING POLICY */}
            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">📦 Shipping Policy</h3>
              <div className="text-sm text-gray-700 space-y-1 whitespace-pre-line">
                {product.shippingPolicy || "Free shipping on orders above ₹500\nStandard delivery: 5-7 business days\nExpress delivery: 2-3 business days (extra charges apply)"}
              </div>
            </div>
            
            {/* RETURN POLICY */}
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">↩ Return & Exchange Policy</h3>
              <div className="text-sm text-gray-700 space-y-1 whitespace-pre-line">
                {product.returnPolicy || "30-day return window from delivery date\nProduct must be unused and in original packaging\nFree return shipping for defective items"}
              </div>
            </div>
            
            {/* RELATED PRODUCTS */}
            <div className="pt-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
               
                <span>You might also like</span>
              </h3>
              
              {relatedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {relatedProducts.map((p: Product) => (
                    <Link 
                      href={`/products/${p.id}`}
                      key={p.id}
                      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-teal-300 h-fit block"
                    >
                      <div className="relative aspect-square bg-gray-50 overflow-hidden">
                        {p.thumbnail ? (
                          <img
                            src={getImageUrl(p.thumbnail) || undefined}
                            alt={p.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='system-ui' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag size={32} className="opacity-20" />
                          </div>
                        )}
                        
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        
                        <button 
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-md z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Handle wishlist toggle
                            if (!user) {
                              router.push('/login');
                              return;
                            }
                            // Wishlist functionality would go here
                          }}
                        >
                          <Heart size={14} className="text-gray-500 hover:text-red-500 transition-colors" />
                        </button>
                      </div>
                      
                      <div className="p-3">
                        <h4 className="text-xs font-medium text-gray-700 line-clamp-1 group-hover:text-teal-600 transition-colors">
                          {p.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs font-bold text-gray-900">
                            ₹{p.minPrice}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {p.variants.slice(0, 2).map((v: any, idx: number) => (
                              <span
                                key={idx}
                                className="w-2 h-2 rounded-full border border-gray-200"
                                style={{ backgroundColor: v.color.toLowerCase() }}
                              />
                            ))}
                            {p.variants.length > 2 && (
                              <span className="text-[8px] text-gray-400">+{p.variants.length - 2}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-5xl mb-4">🛒</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No related products found</h4>
                  <p className="text-gray-600 max-w-md mx-auto">
                    We couldn't find any other products in this category. Check out our full collection!
                  </p>
                  <Link 
                    href="/products" 
                    className="inline-block mt-4 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Browse All Products
                  </Link>
                </div>
              )}
            </div>
          </div>

      {/* ZOOM MODAL */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-4xl max-h-full flex items-center">
            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateZoomImage('prev');
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all duration-200 text-2xl z-10"
              >
                ‹
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setZoomImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl font-bold z-20"
              >
                ✕
              </button>
              {(() => {
                const zoomImageData = images.find(img => img.image === zoomImage);
                const imageUrl = getImageUrl(zoomImage);
                const currentIndex = images.findIndex(img => img.image === zoomImage) + 1;
                const viewLabel = zoomImageData?.view ? zoomImageData.view.charAt(0).toUpperCase() + zoomImageData.view.slice(1).toLowerCase() : 'Product';
                const altText = `${product.name} - ${selectedColor ? selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1) : 'Product'} - ${viewLabel} view (zoomed)`;

                return (
                  <div className="relative">
                    <img
                      src={imageUrl || undefined}
                      alt={altText}
                      className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Enhanced Zoom Info */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <div className="flex gap-2">
                        <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {currentIndex} of {images.length}
                        </div>
                      </div>
                      <button
                        onClick={() => setZoomImage(null)}
                        className="text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>



                    {/* Zoom Instructions */}
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm text-center max-w-xs">
                      <div>Click outside or press ESC to close</div>
                      {images.length > 1 && <div className="mt-1">Use arrow keys to navigate</div>}
                      {zoomImageData && (
                        <div className="mt-2 text-xs text-gray-300">
                          Standard Quality • JPG/PNG
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateZoomImage('next');
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 text-white p-3 rounded-full hover:bg-opacity-90 transition-all duration-200 text-2xl z-10"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
