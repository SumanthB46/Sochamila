"use client";

import { useConfigurator } from "../ConfiguratorContext";
import { ProductType } from "@/types/configurator";

/* ======================================================
   DESIGN TEMPLATES
====================================================== */

const DESIGN_TEMPLATES: {
  id: string;
  name: string;
  productType: ProductType;
  colors: string[];
}[] = [
  { id: "classic-blue", name: "Classic Blue", productType: "jersey", colors: ["#2563eb", "#1e40af"] },
  { id: "striped-red", name: "Striped Red", productType: "jersey", colors: ["#dc2626", "#991b1b", "#ffffff"] },
  { id: "elegant-black", name: "Elegant Black", productType: "jersey", colors: ["#1f2937", "#374151", "#ffffff"] },
  { id: "neon-green", name: "Neon Green", productType: "jersey", colors: ["#22c55e", "#16a34a", "#000000"] },
  { id: "royal-purple", name: "Royal Purple", productType: "jersey", colors: ["#7c3aed", "#5b21b6", "#fbbf24"] },
  { id: "sunset-orange", name: "Sunset Orange", productType: "jersey", colors: ["#f97316", "#ea580c", "#1f2937"] },
  { id: "clean-white", name: "Clean White", productType: "jersey", colors: ["#ffffff", "#e5e7eb", "#374151"] },
  { id: "bold-yellow", name: "Bold Yellow", productType: "jersey", colors: ["#facc15", "#eab308", "#1f2937"] },
];

/* ======================================================
   COMPONENT
====================================================== */

export default function DesignTab() {
  const { selectedProduct, setSelectedProduct, setColor, getAreasForProduct } = useConfigurator();

  const applyTemplate = (template: typeof DESIGN_TEMPLATES[0]) => {
    setSelectedProduct(template.productType);
    const areas = getAreasForProduct(template.productType);
    
    // Apply colors to areas
    areas.forEach((area, index) => {
      const color = template.colors[index % template.colors.length];
      setColor(area, color);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Select design</h3>
        <p className="text-xs text-gray-500">Choose a standard design</p>
      </div>

      {/* Product Type Selector */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Product Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(["jersey", "shorts", "pants", "tracksuit"] as ProductType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedProduct(type)}
              className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors
                ${
                  selectedProduct === type
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Design Templates Grid */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Designs</label>
        <div className="grid grid-cols-2 gap-3">
          {DESIGN_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => applyTemplate(template)}
              className="group relative aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors"
            >
              {/* Color Preview */}
              <div className="absolute inset-0 flex">
                {template.colors.map((color, i) => (
                  <div
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              
              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/90 py-1.5 px-2">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {template.name}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          Select a design template to quickly apply a color scheme. You can customize further using other tabs.
        </p>
      </div>
    </div>
  );
}
