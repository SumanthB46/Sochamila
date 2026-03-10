"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { X, Filter, ChevronDown, ShoppingBag, Heart, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/types/product";
import api from "@/lib/axios";
import { useAuth } from "@/lib/useAuth";

/* ================= CONFIG ================= */

const API_URL = "http://localhost:5000";

/* ================= CONSTANTS ================= */

const GENDERS = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "KIDS", label: "Kids" },
  { value: "UNISEX", label: "Unisex" },
];

const CATEGORIES = [
  { value: "CLOTHING", label: "Clothing" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "HOME_LIVING", label: "Home & Living" },
  { value: "GEAR", label: "Gear" },
];

const PRODUCT_TYPES_BY_CATEGORY: Record<string, { value: string; label: string }[]> = {
  CLOTHING: [
    { value: "TSHIRT", label: "T-Shirt" },
    { value: "SHIRT", label: "Shirt" },
    { value: "HOODIE", label: "Hoodie" },
    { value: "SWEATSHIRT", label: "Sweatshirt" },
    { value: "JACKET", label: "Jacket" },
  ],
  ACCESSORIES: [
    { value: "CAP", label: "Cap" },
    { value: "BAG", label: "Bag" },
    { value: "PHONE_CASE", label: "Phone Case" },
  ],
  HOME_LIVING: [
    { value: "MUG", label: "Mug" },
  ],
  GEAR: [
    { value: "CAP", label: "Cap" },
    { value: "BAG", label: "Bag" },
  ],
};

const ALL_PRODUCT_TYPES = [
  { value: "TSHIRT", label: "T-Shirt" },
  { value: "SHIRT", label: "Shirt" },
  { value: "HOODIE", label: "Hoodie" },
  { value: "SWEATSHIRT", label: "Sweatshirt" },
  { value: "JACKET", label: "Jacket" },
  { value: "CAP", label: "Cap" },
  { value: "MUG", label: "Mug" },
  { value: "BAG", label: "Bag" },
  { value: "PHONE_CASE", label: "Phone Case" },
];

const COLORS = [
  // Reds
  { name: "Red", hex: "#EF4444" },
  { name: "Crimson", hex: "#DC2626" },
  { name: "Maroon", hex: "#7F1D1D" },
  { name: "Dark Red", hex: "#991B1B" },
  { name: "Deep Red", hex: "#5A1515" },
  // Pinks
  { name: "Hot Pink", hex: "#EC4899" },
  { name: "Pink", hex: "#EC4899" },
  { name: "Light Pink", hex: "#FBB6CE" },
  { name: "Rose", hex: "#F43F5E" },
  // Purples
  { name: "Magenta", hex: "#D946EF" },
  { name: "Purple", hex: "#A855F7" },
  { name: "Dark Purple", hex: "#6B21A8" },
  { name: "Indigo", hex: "#4F46E5" },
  { name: "Lavender", hex: "#E9D5FF" },
  { name: "Light Purple", hex: "#DDD6FE" },
  // Blues
  { name: "Light Blue", hex: "#93C5FD" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Blue", hex: "#3B82F6" },
  { name: "Dark Blue", hex: "#1E40AF" },
  { name: "Navy", hex: "#001F3F" },
  { name: "Cobalt", hex: "#0338EE" },
  // Cyans/Teals
  { name: "Cyan", hex: "#06B6D4" },
  { name: "Teal", hex: "#14B8A6" },
  { name: "Dark Teal", hex: "#0D9488" },
  { name: "Turquoise", hex: "#20C997" },
  { name: "Light Cyan", hex: "#A5F3FC" },
  // Greens
  { name: "Lime", hex: "#84CC16" },
  { name: "Green", hex: "#22C55E" },
  { name: "Dark Green", hex: "#166534" },
  { name: "Forest Green", hex: "#15803D" },
  { name: "Olive", hex: "#6B7280" },
  { name: "Light Green", hex: "#BBF7D0" },
  { name: "Sea Green", hex: "#20B2AA" },
  // Yellows/Golds
  { name: "Yellow", hex: "#EAB308" },
  { name: "Gold", hex: "#FBBF24" },
  { name: "Light Yellow", hex: "#FEFCE8" },
  { name: "Amber", hex: "#FCD34D" },
  // Oranges
  { name: "Orange", hex: "#FB923C" },
  { name: "Dark Orange", hex: "#EA580C" },
  { name: "Rust", hex: "#CC5500" },
  // Browns/Tans
  { name: "Tan", hex: "#D2B48C" },
  { name: "Beige", hex: "#F5F5DC" },
  { name: "Brown", hex: "#92400E" },
  { name: "Dark Brown", hex: "#5A3A1A" },
  { name: "Chocolate", hex: "#6B3410" },
  { name: "Khaki", hex: "#C3B091" },
  // Grays
  { name: "Light Gray", hex: "#D1D5DB" },
  { name: "Gray", hex: "#9CA3AF" },
  { name: "Dark Gray", hex: "#4B5563" },
  { name: "Charcoal", hex: "#36454F" },
  { name: "Slate", hex: "#64748B" },
  // Neutrals
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#000000" },
  { name: "Off-White", hex: "#F9FAFB" },
];

const COLOR_MAP: Record<string, string> = Object.fromEntries(
  COLORS.map(c => [c.name.toLowerCase().replace(/\s+/g, ''), c.hex])
);

/* ================= PAGE ================= */

export default function ProductsList() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  /* WISHLIST STATE */
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState(false);

  /* FILTER STATE */
  const [gender, setGender] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
  const [color, setColor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<"" | "price-asc" | "price-desc">("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showColorGrid, setShowColorGrid] = useState(false);

  /* Multi-select helpers */
  const toggleCategory = (value: string) => {
    setSelectedCategories(prev => 
      prev.includes(value) 
        ? prev.filter(c => c !== value)
        : [...prev, value]
    );
    // Clear product types when category changes
    setSelectedProductTypes([]);
  };

  const toggleProductType = (value: string) => {
    setSelectedProductTypes(prev => 
      prev.includes(value) 
        ? prev.filter(p => p !== value)
        : [...prev, value]
    );
  };

  const clearAllFilters = () => {
    setGender(null);
    setSelectedCategories([]);
    setSelectedProductTypes([]);
    setColor(null);
    setSearch("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
  };

  /* ================= FETCH ================= */

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log("[ProductsList] Fetching products...");
        const response = await api.get("/products");
        
        // backend returns { success, data }
        console.log("[ProductsList] Response:", response.data);
        const data = response.data?.data;
        
        if (Array.isArray(data)) {
          console.log(`[ProductsList] Loaded ${data.length} products`);
          setProducts(data);
        } else {
          console.warn("[ProductsList] Invalid data format:", data);
          setProducts([]);
        }
      } catch (error: any) {
        console.error("[ProductsList] Failed to fetch products:", error);
        console.error("[ProductsList] Error response:", error?.response?.data);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);
  
  /* ================= FETCH WISHLIST ================= */
  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(new Set());
      return;
    }
    try {
      const response = await api.get("/wishlist");
      const data = response.data?.data || [];
      setWishlist(new Set(data.map((item: { id: string }) => item.id)));
    } catch (error) {
      console.error("[ProductsList] Failed to fetch wishlist:", error);
      setWishlist(new Set());
    }
  }, [user]);
  
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  /* ================= FILTER + SORT ================= */

  const filteredProducts = useMemo(() => {
    let list = [...products];

    list = list.filter((p) => {
      if (gender && p.gender !== gender) return false;
      if (selectedCategories.length > 0 && !selectedCategories.includes(p.department)) return false;
      if (selectedProductTypes.length > 0 && !selectedProductTypes.includes(p.productType)) return false;

      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase())
      )
        return false;

      if (
        color &&
        !p.variants.some(
          (v) => v.color.toLowerCase() === color.toLowerCase()
        )
      )
        return false;

      if (
        inStockOnly &&
        !p.variants.some((v) => v.stock > 0)
      )
        return false;

      const prices = p.variants.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (minPrice && min < Number(minPrice)) return false;
      if (maxPrice && max > Number(maxPrice)) return false;

      return true;
    });

    if (sort === "price-asc") {
      list.sort((a, b) => a.minPrice - b.minPrice);
    }

    if (sort === "price-desc") {
      list.sort((a, b) => b.minPrice - a.minPrice);
    }

    return list;
  }, [
    products,
    gender,
    selectedCategories,
    selectedProductTypes,
    color,
    search,
    inStockOnly,
    sort,
    minPrice,
    maxPrice,
  ]);

  if (loading) {
    return <ProductsSkeleton />;
  }

  /* ================= ACTIVE FILTERS ================= */
  const activeFilters = [
    gender && { key: "gender", label: GENDERS.find(g => g.value === gender)?.label, onRemove: () => setGender(null) },
    ...selectedCategories.map(cat => ({ 
      key: `category-${cat}`, 
      label: CATEGORIES.find(c => c.value === cat)?.label, 
      onRemove: () => toggleCategory(cat) 
    })),
    ...selectedProductTypes.map(type => ({ 
      key: `type-${type}`, 
      label: ALL_PRODUCT_TYPES.find(p => p.value === type)?.label, 
      onRemove: () => toggleProductType(type) 
    })),
    color && { key: "color", label: color, onRemove: () => setColor(null) },
    inStockOnly && { key: "stock", label: "In Stock", onRemove: () => setInStockOnly(false) },
    minPrice && { key: "minPrice", label: `Min ₹${minPrice}`, onRemove: () => setMinPrice("") },
    maxPrice && { key: "maxPrice", label: `Max ₹${maxPrice}`, onRemove: () => setMaxPrice("") },
  ].filter(Boolean) as { key: string; label: string | undefined; onRemove: () => void }[];

  return (
    <section className="px-4 sm:px-6 py-6">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
      </div>

      {/* ================= ENHANCED TOP FILTER BAR ================= */}
      <div className="bg-gradient-to-r from-white to-gray-50 border rounded-xl p-4 mb-4 shadow-sm">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-4 items-center flex-1">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border rounded-full hover:shadow-md transition-all"
          >
            <SlidersHorizontal size={18} />
            <span>Filters</span>
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
            />
            <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Price Range */}
          <div className="hidden md:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border shadow-sm">
            <span className="text-sm text-gray-500">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-16 text-sm focus:outline-none"
            />
            <span className="text-gray-300">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-16 text-sm focus:outline-none"
            />
          </div>

          {/* Color Grid Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowColorGrid(!showColorGrid)}
              className="flex items-center gap-2 bg-white border pl-3 pr-10 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer min-w-[120px]"
            >
              <div 
                className="w-4 h-4 rounded-full border"
                style={{ 
                  backgroundColor: color ? COLORS.find(c => c.name === color)?.hex : 'transparent',
                  borderColor: color ? 'transparent' : '#ccc'
                }} 
              />
              <span className="text-sm">{color || "All Colors"}</span>
            </button>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-transform ${showColorGrid ? 'rotate-180' : ''}`} size={16} />
            
            {/* Color Grid Popup */}
            {showColorGrid && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowColorGrid(false)} />
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Select Color</span>
                    {color && (
                      <button
                        onClick={() => { setColor(null); setShowColorGrid(false); }}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => { setColor(c.name); setShowColorGrid(false); }}
                        className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                          color === c.name
                            ? "border-teal-600 ring-2 ring-teal-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "price-asc" | "price-desc" | "")}
              className="appearance-none bg-white border pl-4 pr-10 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm cursor-pointer"
            >
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>

          {/* In Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${
              inStockOnly
                ? "bg-teal-600 text-white border-teal-600 shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            In Stock
          </button>

          {/* Clear All */}
          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <X size={16} /> Clear all
            </button>
          )}
          </div>
          
          {/* Product Count - Right Side */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border shadow-sm">
            <span className="font-semibold text-teal-600">{filteredProducts.length}</span>
            <span>product{filteredProducts.length !== 1 ? "s" : ""} found</span>
          </div>
        </div>
      </div>

      {/* ================= ACTIVE FILTERS ================= */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeFilters.map((filter) => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full text-sm font-medium animate-in fade-in slide-in-from-bottom-2"
            >
              {filter.label}
              <button
                onClick={filter.onRemove}
                className="hover:bg-teal-200 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* ================= LAYOUT: SIDEBAR + GRID ================= */}
      <div className="flex gap-6">
        {/* LEFT SIDEBAR FILTERS */}
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          {/* Gender Filter */}
          <FilterSection title="Gender" icon="👤">
            <div className="space-y-1">
              {GENDERS.map((g) => (
                <FilterCheckbox
                  key={g.value}
                  checked={gender === g.value}
                  onChange={() => setGender(gender === g.value ? null : g.value)}
                  label={g.label}
                />
              ))}
            </div>
          </FilterSection>

          {/* Category Filter */}
          <FilterSection title="Category" icon="🏷️">
            <div className="space-y-1">
              {CATEGORIES.map((c) => (
                <FilterCheckbox
                  key={c.value}
                  checked={selectedCategories.includes(c.value)}
                  onChange={() => toggleCategory(c.value)}
                  label={c.label}
                />
              ))}
            </div>
          </FilterSection>

          {/* Product Type Filter - Dynamic based on selected Categories */}
          <FilterSection title="Product Type" icon="👕">
            <div className="space-y-1">
              {(selectedCategories.length > 0 
                ? selectedCategories.flatMap(cat => PRODUCT_TYPES_BY_CATEGORY[cat] || [])
                : ALL_PRODUCT_TYPES
              ).map((p) => (
                <FilterCheckbox
                  key={p.value}
                  checked={selectedProductTypes.includes(p.value)}
                  onChange={() => toggleProductType(p.value)}
                  label={p.label}
                />
              ))}
            </div>
          </FilterSection>


        </aside>

        {/* MOBILE FILTER DRAWER */}
        {showMobileFilters && (
          <MobileFilterDrawer
            onClose={() => setShowMobileFilters(false)}
            gender={gender}
            setGender={setGender}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            selectedProductTypes={selectedProductTypes}
            toggleProductType={toggleProductType}
            color={color}
            setColor={setColor}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
          />
        )}

        {/* GRID */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-min">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-32 text-center text-gray-500">
              No products found
            </div>
          ) : (
            filteredProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                isInWishlist={wishlist.has(p.id)}
                onToggleWishlist={async (product) => {
                  if (!user) {
                    window.location.href = "/login";
                    return;
                  }
                  setWishlistLoading(true);
                  try {
                    if (wishlist.has(product.id)) {
                      await api.delete(`/wishlist/${product.id}`);
                      setWishlist(prev => {
                        const next = new Set(prev);
                        next.delete(product.id);
                        return next;
                      });
                    } else {
                      await api.post("/wishlist", { id: product.id, title: product.name });
                      setWishlist(prev => new Set(prev).add(product.id));
                    }
                  } catch (error) {
                    console.error("[ProductsList] Wishlist toggle failed:", error);
                  } finally {
                    setWishlistLoading(false);
                  }
                }}
                isWishlistLoading={wishlistLoading}
              />
            ))
          )}
        </div>
      </div>
    </section>
  );
}

/* ================= UI HELPERS ================= */

function FilterSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
        <span>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function FilterCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-3 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors group">
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
        checked ? "bg-teal-600 border-teal-600" : "border-gray-300 group-hover:border-teal-400"
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
      <span className={`text-sm transition-colors ${checked ? "text-teal-700 font-medium" : "text-gray-600"}`}>
        {label}
      </span>
    </label>
  );
}

/* ================= MOBILE FILTER DRAWER ================= */

function MobileFilterDrawer({
  onClose,
  gender,
  setGender,
  selectedCategories,
  toggleCategory,
  selectedProductTypes,
  toggleProductType,
  color,
  setColor,
  inStockOnly,
  setInStockOnly,
}: {
  onClose: () => void;
  gender: string | null;
  setGender: (v: string | null) => void;
  selectedCategories: string[];
  toggleCategory: (v: string) => void;
  selectedProductTypes: string[];
  toggleProductType: (v: string) => void;
  color: string | null;
  setColor: (v: string | null) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-6">
          <MobileFilterSection title="Gender">
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button
                  key={g.value}
                  onClick={() => setGender(gender === g.value ? null : g.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    gender === g.value
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </MobileFilterSection>

          <MobileFilterSection title="Category">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => toggleCategory(c.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategories.includes(c.value)
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </MobileFilterSection>

          <MobileFilterSection title="Product Type">
            <div className="flex flex-wrap gap-2">
              {(selectedCategories.length > 0 
                ? selectedCategories.flatMap(cat => PRODUCT_TYPES_BY_CATEGORY[cat] || [])
                : ALL_PRODUCT_TYPES
              ).map((p: { value: string; label: string }) => (
                <button
                  key={p.value}
                  onClick={() => toggleProductType(p.value)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedProductTypes.includes(p.value)
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </MobileFilterSection>

          <MobileFilterSection title="Color">
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(color === c.name ? null : c.name)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.name ? "border-teal-600 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </MobileFilterSection>

          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500"
            />
            <span className="font-medium">In stock only</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function MobileFilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold mb-3 text-gray-900">{title}</h3>
      {children}
    </div>
  );
}

/* ================= SKELETON LOADING ================= */

function ProductsSkeleton() {
  return (
    <section className="px-4 sm:px-6 py-6">
      <div className="mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse" />
      </div>
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="h-10 w-64 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
      <div className="flex gap-6">
        <aside className="w-64 shrink-0 hidden lg:block space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-5 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-8 w-full bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </aside>
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-white border rounded-xl p-3">
              <div className="aspect-square bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-4 w-3/4 bg-gray-200 rounded mt-2 animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded mt-2 animate-pulse" />
              <div className="h-8 w-full bg-gray-200 rounded mt-3 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= PRODUCT CARD ================= */

/* IMAGE URL HELPER - handles Windows paths, backslashes, etc. */
const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) return null;
  
  // Normalize: replace backslashes, trim, remove Windows drive letters
  let p = String(imagePath).replace(/\\/g, "/").trim();
  p = p.replace(/^[A-Za-z]:\//, "");
  
  // Ensure uploads/ paths have leading slash
  if (p.startsWith("uploads/")) p = "/" + p;
  
  // Build full URL
  if (p.startsWith("http")) return p;
  if (p.startsWith("/uploads/")) return `${API_URL}${p}`;
  if (p.startsWith("/")) return `${API_URL}${p}`;
  return `${API_URL}/uploads/${p}`;
};

function ProductCard({ 
  product, 
  isInWishlist, 
  onToggleWishlist,
  isWishlistLoading 
}: { 
  product: Product; 
  isInWishlist: boolean;
  onToggleWishlist: (product: Product) => void;
  isWishlistLoading: boolean;
}) {
  const images: string[] = [];

  // Try thumbnail first
  if (product.thumbnail) {
    const url = getImageUrl(product.thumbnail);
    if (url) images.push(url);
  }
  
  // Then add variant images
  product.variants?.forEach((v) => {
    v.images?.forEach((img) => {
      const url = getImageUrl(img.image);
      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const colors = Array.from(
    new Set(product.variants.map((v) => v.color.toLowerCase()))
  );

  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = totalStock === 0;

  useEffect(() => {
    if (isHovered && images.length > 1) {
      let i = 0;
      const id = setInterval(() => {
        i = (i + 1) % images.length;
        setActiveIndex(i);
      }, 1200);
      return () => clearInterval(id);
    } else {
      setActiveIndex(0);
    }
  }, [isHovered, images.length]);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-teal-300 h-fit block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/4.5] bg-gray-50 overflow-hidden">
        {images.length ? (
          <img
            src={images[activeIndex]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23e5e7eb' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%239ca3af' font-family='system-ui' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-300">
            <ShoppingBag size={32} className="opacity-20" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.isActive && (
            <span className="px-1.5 py-0.5 bg-gray-800 text-white text-[9px] font-medium rounded">
              Inactive
            </span>
          )}
          {isOutOfStock && (
            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-medium rounded">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          className={`absolute top-2 right-2 p-1.5 bg-white rounded-full transition-all duration-200 hover:scale-110 shadow-md z-10 ${
            isInWishlist ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          } ${isWishlistLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={isWishlistLoading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product);
          }}
        >
          <Heart 
            size={14} 
            className={`transition-colors ${
              isInWishlist 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-500 hover:text-red-500'
            }`} 
          />
        </button>

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.slice(0, 4).map((_, idx) => (
              <span
                key={idx}
                className={`w-1 h-1 rounded-full transition-all ${
                  idx === activeIndex ? "bg-white w-2" : "bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content - Minimal */}
      <div className="px-2 py-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[11px] font-medium text-gray-700 line-clamp-1 group-hover:text-teal-600 transition-colors flex-1 leading-tight">
            {product.name}
          </h3>
          <p className="text-xs font-bold text-gray-900 whitespace-nowrap">
            ₹{product.minPrice}
          </p>
        </div>
        {product.description && (
          <p className="text-[9px] text-gray-500 line-clamp-1 mt-0.5">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span className="text-[9px] text-gray-400">
            {product.department}
          </span>
          {colors.length > 0 && (
            <div className="flex items-center gap-0.5">
              {colors.slice(0, 2).map((c) => (
                <span
                  key={c}
                  className="w-2.5 h-2.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: COLOR_MAP[c] || c }}
                />
              ))}
              {colors.length > 2 && (
                <span className="text-[8px] text-gray-400">+{colors.length - 2}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
