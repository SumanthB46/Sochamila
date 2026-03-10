"use client";

import { Plus, ShoppingCart, RotateCcw } from "lucide-react";
import { useConfigurator } from "./ConfiguratorContext";

/* ======================================================
   COMPONENT
====================================================== */

export default function BottomBar() {
  const { selectedProduct, reset } = useConfigurator();

  const productLabels: Record<string, string> = {
    jersey: "Jersey",
    shorts: "Shorts",
    pants: "Pants",
    tracksuit: "Tracksuit",
  };

  return (
    <div className="h-20 bg-white border-t border-gray-200 flex items-center justify-between px-6">
      {/* Left - Product Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-2xl">
            {selectedProduct === "jersey" && "👕"}
            {selectedProduct === "shorts" && "🩳"}
            {selectedProduct === "pants" && "👖"}
            {selectedProduct === "tracksuit" && "🧥"}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {productLabels[selectedProduct]}
          </p>
          <p className="text-xs text-gray-500">Custom Design</p>
        </div>
      </div>

      {/* Center - Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Right - Add to Cart */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
          <Plus size={18} />
          Add Product
        </button>
        <button className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <ShoppingCart size={18} />
          Add to Cart
        </button>
      </div>
    </div>
  );
}
