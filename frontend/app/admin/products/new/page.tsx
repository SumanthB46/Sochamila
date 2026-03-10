"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Package, 
  Palette, 
  Tag, 
  Users, 
  Layers,
  Save,
  ChevronDown,
  ImageIcon,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

/* ======================================================
   TYPES
====================================================== */

type Size = {
  size: string;
  mrp: number;
  price: number;
  stock: number;
};

type ColorVariant = {
  name: string;
  sizes: Size[];
};

/* ======================================================
   CONSTANTS - Aligned with ProductsList
====================================================== */

const GENDERS = [
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "KIDS", label: "Kids" },
  { value: "UNISEX", label: "Unisex" },
];

const CATEGORIES = [
  { value: "CLOTHING", label: "Clothing" },
  { value: "ACCESSORIES", label: "Accessories" },
  { value: "HOME", label: "Home" },
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
  ],
  HOME: [
    { value: "MUG", label: "Mug" },
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
];

// Comprehensive color palette with hex values
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

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

/* ======================================================
   UI HELPER COMPONENTS (Outside main component to prevent re-renders)
====================================================== */

const SectionCard = ({ 
  title, 
  icon: Icon, 
  children, 
  className = "" 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`bg-white border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm ${className}`}>
    <div className="flex items-center gap-2 mb-4 sm:mb-5">
      <div className="p-1.5 sm:p-2 bg-teal-50 rounded-lg">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
      </div>
      <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{title}</h3>
    </div>
    {children}
  </section>
);

const Input = ({ 
  label, 
  error, 
  required,
  className = "",
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { 
  label: string; 
  error?: string;
  required?: boolean;
}) => (
  <div className={className}>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-sm sm:text-base ${
        error ? "border-red-300" : "border-gray-200 hover:border-gray-300"
      }`}
      {...props}
    />
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

const Select = ({ 
  label, 
  error, 
  required,
  children,
  className = "",
  ...props 
}: React.SelectHTMLAttributes<HTMLSelectElement> & { 
  label: string; 
  error?: string;
  required?: boolean;
}) => (
  <div className={className}>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      <select
        className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all appearance-none bg-white text-sm sm:text-base ${
          error ? "border-red-300" : "border-gray-200 hover:border-gray-300"
        }`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

/* ======================================================
   COLOR PICKER COMPONENT
====================================================== */

function ColorPicker({ 
  selectedColor, 
  onSelect 
}: { 
  selectedColor: string; 
  onSelect: (color: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const displayColors = showAll ? COLORS : COLORS.slice(0, 20);
  const remainingCount = COLORS.length - 20;

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-gray-500 mb-2">
        Select Color
      </label>
      <div className="flex flex-wrap gap-2">
        {displayColors.map(c => (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelect(c.name)}
            className={`w-8 h-8 rounded-lg transition-all border-2 ${
              selectedColor === c.name
                ? "border-teal-600 ring-2 ring-teal-200 scale-110"
                : "border-transparent hover:scale-105"
            }`}
            style={{ backgroundColor: c.hex }}
            title={c.name}
          />
        ))}
        {!showAll && remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="w-8 h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs hover:border-teal-300 hover:text-teal-600 transition-colors"
          >
            +{remainingCount}
          </button>
        )}
      </div>
      {showAll && (
        <button
          type="button"
          onClick={() => setShowAll(false)}
          className="mt-2 text-xs text-teal-600 hover:text-teal-700 font-medium"
        >
          Show less
        </button>
      )}
    </div>
  );
}

/* ======================================================
   PAGE
====================================================== */

export default function AddProductPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [imagePositions, setImagePositions] = useState<string[]>([]);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    gender: "",
    department: "",
    productType: "",
    shippingPolicy: "Free shipping on orders above ₹500\nStandard delivery: 5-7 business days\nExpress delivery: 2-3 business days (extra charges apply)",
    returnPolicy: "30-day return window from delivery date\nProduct must be unused and in original packaging\nFree return shipping for defective items",
  });

  const [colors, setColors] = useState<ColorVariant[]>([
    {
      name: "",
      sizes: [{ size: "", mrp: 0, price: 0, stock: 1 }],
    },
  ]);

  const [activeSection, setActiveSection] = useState<string>("basic");

  /* ======================================================
     IMAGE HANDLING
  ====================================================== */

  const handleImages = (files: FileList | null) => {
    if (!files) return;

    const list = Array.from(files);
    const newPositions = list.map((_, i) => {
      const idx = images.length + i;
      if (idx === 0) return "front";
      if (idx === 1) return "back";
      return "other";
    });

    setImages(prev => [...prev, ...list]);
    setPreviews(prev => [
      ...prev,
      ...list.map(file => URL.createObjectURL(file)),
    ]);
    setImagePositions(prev => [...prev, ...newPositions]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setImagePositions(prev => prev.filter((_, i) => i !== index));
  };

  const updateImagePosition = (index: number, position: string) => {
    setImagePositions(prev => {
      const updated = [...prev];
      updated[index] = position;
      return updated;
    });
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === images.length - 1) return;

    const newIndex = direction === 'left' ? index - 1 : index + 1;

    // Swap images
    setImages(prev => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });

    // Swap previews
    setPreviews(prev => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });

    // Swap positions
    setImagePositions(prev => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  /* ======================================================
     VARIANTS
  ====================================================== */

  const updateColor = (ci: number, value: string) => {
    const updated = [...colors];
    updated[ci].name = value;
    setColors(updated);
  };

  const updateSize = (
    ci: number,
    si: number,
    field: keyof Size,
    value: number | string
  ) => {
    const updated = [...colors];
    updated[ci].sizes[si] = {
      ...updated[ci].sizes[si],
      [field]: value,
    };
    setColors(updated);
  };

  const addColor = () => {
    setColors(prev => [
      ...prev,
      { name: "", sizes: [{ size: "", mrp: 0, price: 0, stock: 1 }] },
    ]);
  };

  const addSize = (ci: number) => {
    const updated = [...colors];
    updated[ci].sizes.push({
      size: "",
      mrp: 0,
      price: 0,
      stock: 1,
    });
    setColors(updated);
  };

  /* ======================================================
     VALIDATION
  ====================================================== */

  const validate = () => {
    if (!product.name.trim()) return "Product name is required";
    if (!product.gender) return "Gender is required";
    if (!product.department) return "Category is required";
    if (!product.productType) return "Product type is required";
    if (images.length === 0) return "At least one product image is required";

    for (const color of colors) {
      if (!color.name) return "Please select a color for all variants";
      for (const size of color.sizes) {
        if (!size.size) return "Please select a size for all variants";
        if (size.price <= 0) return "Price must be greater than 0";
        if (size.stock < 0) return "Stock cannot be negative";
      }
    }

    return null;
  };

  /* ======================================================
     SUBMIT (🔥 FIXED)
  ====================================================== */

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const form = new FormData();

      form.append("name", product.name);
      form.append("description", product.description);
      form.append("gender", product.gender);
      form.append("department", product.department);
      form.append("productType", product.productType);
      form.append("shippingPolicy", product.shippingPolicy);
      form.append("returnPolicy", product.returnPolicy);

      // REQUIRED BY BACKEND
      form.append("productImageCount", images.length.toString());
      form.append("colors", JSON.stringify(colors));
      form.append("imagePositions", JSON.stringify(imagePositions));

      // 🔥 CORRECT FIELD NAME (THIS FIXES 500 ERROR)
      images.forEach(img => {
        form.append("productImages", img);
      });

      await api.post("/admin/products", form);
      
      setSuccess(true);
      setTimeout(() => router.push("/admin/products"), 1500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to create product"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => router.push("/admin/products")}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">Create a new product with variants</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 sm:gap-2 bg-teal-600 text-white px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save Product</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
            <p className="text-sm font-medium">Product created successfully! Redirecting...</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <SectionCard title="Basic Information" icon={Package}>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  placeholder="Enter product name"
                  value={product.name}
                  onChange={e => setProduct({ ...product, name: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your product..."
                    value={product.description}
                    onChange={e => setProduct({ ...product, description: e.target.value })}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Images */}
            <SectionCard title="Product Images" icon={ImageIcon}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {previews.map((img, i) => (
                  <div key={i} className="relative group">
                    {/* Order Number - Top Right Legend Style */}
                    <div className="absolute -top-2 -right-2 z-10">
                      <span className="text-xs font-bold px-2.5 py-1 bg-teal-600 text-white rounded-lg shadow-md border-2 border-white">
                        #{i + 1}
                      </span>
                    </div>
                    
                    {/* Image Container */}
                    <div className="aspect-square border rounded-xl overflow-hidden bg-gray-50 relative">
                      <img
                        src={img}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Hover Overlay with Controls */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {/* Move Left */}
                        <button
                          onClick={() => moveImage(i, 'left')}
                          disabled={i === 0}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Move Left"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        
                        {/* Delete */}
                        <button
                          onClick={() => removeImage(i)}
                          className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                        
                        {/* Move Right */}
                        <button
                          onClick={() => moveImage(i, 'right')}
                          disabled={i === previews.length - 1}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          title="Move Right"
                        >
                          <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    {/* Position Selector - Bottom */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-10">
                      <select
                        value={imagePositions[i] || "other"}
                        onChange={(e) => updateImagePosition(i, e.target.value)}
                        className="text-xs font-medium px-2 py-1 bg-teal-600 text-white rounded-full border-2 border-white shadow-md cursor-pointer hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-300"
                      >
                        <option value="front">Front</option>
                        <option value="back">Back</option>
                        <option value="left">Left Side</option>
                        <option value="right">Right Side</option>
                        <option value="detail">Detail</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}

                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all">
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-sm font-medium">Upload</span>
                  <input
                    hidden
                    multiple
                    type="file"
                    accept="image/*"
                    onChange={e => handleImages(e.target.files)}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Upload product images. First image will be used as thumbnail. Drag or use arrows to reorder. Select position (Front/Back/Side) for each image.
              </p>
            </SectionCard>

            {/* Variants */}
            <SectionCard title="Variants" icon={Layers}>
              <div className="space-y-4">
                {colors.map((color, ci) => (
                  <div key={ci} className="border rounded-xl p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Color {ci + 1}
                          </span>
                        </div>
                        {color.name && (
                          <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg border">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: COLORS.find(c => c.name === color.name)?.hex }}
                            />
                            <span className="text-xs text-gray-600">{color.name}</span>
                          </div>
                        )}
                      </div>
                      {colors.length > 1 && (
                        <button
                          onClick={() => setColors(colors.filter((_, i) => i !== ci))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Color Picker */}
                    <ColorPicker 
                      selectedColor={color.name}
                      onSelect={(colorName) => updateColor(ci, colorName)}
                    />

                    {/* Sizes */}
                    <div className="space-y-3">
                      <label className="block text-xs font-medium text-gray-500">
                        Size & Pricing
                      </label>
                      {color.sizes.map((s, si) => (
                        <div key={si} className="grid grid-cols-2 sm:grid-cols-12 gap-2 sm:gap-3 items-center">
                          <div className="col-span-1 sm:col-span-3">
                            <Select
                              label=""
                              value={s.size}
                              onChange={e => updateSize(ci, si, "size", e.target.value)}
                            >
                              <option value="">Size</option>
                              {SIZES.map(sz => (
                                <option key={sz} value={sz}>{sz}</option>
                              ))}
                            </Select>
                          </div>
                          <div className="col-span-1 sm:col-span-3">
                            <input
                              type="number"
                              placeholder="MRP"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                              value={s.mrp || ""}
                              onChange={e => updateSize(ci, si, "mrp", Number(e.target.value))}
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-3">
                            <input
                              type="number"
                              placeholder="Price"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                              value={s.price || ""}
                              onChange={e => updateSize(ci, si, "price", Number(e.target.value))}
                            />
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <input
                              type="number"
                              placeholder="Stock"
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                              value={s.stock}
                              onChange={e => updateSize(ci, si, "stock", Number(e.target.value))}
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1 flex justify-end sm:justify-center">
                            {color.sizes.length > 1 && (
                              <button
                                onClick={() => {
                                  const updated = [...colors];
                                  updated[ci].sizes = updated[ci].sizes.filter((_, i) => i !== si);
                                  setColors(updated);
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => addSize(ci)}
                        className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Add Size
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addColor}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/30 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Color
                </button>
              </div>
            </SectionCard>

            {/* Shipping & Return Policy */}
            <SectionCard title="Policies" icon={Tag}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Shipping Policy
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-sm"
                    placeholder="Enter shipping policy..."
                    value={product.shippingPolicy}
                    onChange={e => setProduct({ ...product, shippingPolicy: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default: Free shipping on orders above ₹500, 5-7 business days delivery
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Return Policy
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-sm"
                    placeholder="Enter return policy..."
                    value={product.returnPolicy}
                    onChange={e => setProduct({ ...product, returnPolicy: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default: 30-day return window, product must be unused
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Organization */}
            <SectionCard title="Organization" icon={Tag}>
              <div className="space-y-4">
                <Select
                  label="Gender"
                  required
                  value={product.gender}
                  onChange={e => setProduct({ ...product, gender: e.target.value })}
                >
                  <option value="">Select Gender</option>
                  {GENDERS.map(g => (
                    <option key={g.value} value={g.value}>{g.label}</option>
                  ))}
                </Select>

                <Select
                  label="Category"
                  required
                  value={product.department}
                  onChange={e => {
                    setProduct({ ...product, department: e.target.value, productType: "" });
                  }}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>

                <Select
                  label="Product Type"
                  required
                  value={product.productType}
                  onChange={e => setProduct({ ...product, productType: e.target.value })}
                  disabled={!product.department}
                >
                  <option value="">
                    {product.department ? "Select Type" : "Select Category First"}
                  </option>
                  {(product.department ? PRODUCT_TYPES_BY_CATEGORY[product.department] : []).map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </Select>
              </div>
            </SectionCard>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Product Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-teal-100">Name</span>
                  <span className="font-medium truncate max-w-[150px]">
                    {product.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-100">Gender</span>
                  <span className="font-medium">
                    {GENDERS.find(g => g.value === product.gender)?.label || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-100">Category</span>
                  <span className="font-medium">
                    {CATEGORIES.find(c => c.value === product.department)?.label || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-100">Type</span>
                  <span className="font-medium">
                    {ALL_PRODUCT_TYPES.find(p => p.value === product.productType)?.label || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-100">Images</span>
                  <span className="font-medium">{images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-100">Variants</span>
                  <span className="font-medium">{colors.length} colors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
