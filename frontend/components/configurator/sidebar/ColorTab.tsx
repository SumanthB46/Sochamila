"use client";

import { useState } from "react";
import { RotateCcw, Link2, Unlink } from "lucide-react";
import { useConfigurator, DEFAULT_COLORS } from "../ConfiguratorContext";
import { ProductArea } from "@/types/configurator";

/* ======================================================
   AREA LABELS
====================================================== */

const AREA_LABELS: Record<ProductArea, string> = {
  front: "Front",
  back: "Back",
  leftSleeve: "Left Sleeve",
  rightSleeve: "Right Sleeve",
  collar: "Collar",
  element1: "Element 1",
  element2: "Element 2",
  waistband: "Waistband",
  legs: "Legs",
};

/* ======================================================
   COMPONENT
====================================================== */

export default function ColorTab() {
  const {
    colors,
    setColor,
    linkedAreas,
    linkAreas,
    unlinkArea,
    getAreasForProduct,
    selectedProduct,
  } = useConfigurator();

  const [selectedArea, setSelectedArea] = useState<ProductArea | null>(null);
  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState<ProductArea | null>(null);

  const areas = getAreasForProduct(selectedProduct);

  const handleColorChange = (area: ProductArea, color: string) => {
    setColor(area, color);
  };

  const startLink = (area: ProductArea) => {
    if (linkMode && linkSource) {
      // Complete the link
      if (linkSource !== area) {
        const currentLinks = linkedAreas[linkSource] || [];
        linkAreas(linkSource, [...currentLinks, area]);
      }
      setLinkMode(false);
      setLinkSource(null);
    } else {
      // Start linking
      setLinkMode(true);
      setLinkSource(area);
    }
  };

  const cancelLink = () => {
    setLinkMode(false);
    setLinkSource(null);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Choose colors</h3>
        <p className="text-xs text-gray-500">Decide on your color combination</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600">
          Colors
        </button>
        <button className="flex-1 py-2 text-xs font-medium text-gray-500 hover:text-gray-700">
          Custom
        </button>
      </div>

      {/* Color Areas */}
      <div className="space-y-2">
        {areas.map((area) => (
          <div
            key={area}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors
              ${selectedArea === area ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
          >
            {/* Color Circle */}
            <button
              onClick={() => setSelectedArea(selectedArea === area ? null : area)}
              className="w-8 h-8 rounded-full border-2 border-gray-300 shadow-sm"
              style={{ backgroundColor: colors[area] || "#2563eb" }}
            />

            {/* Area Label */}
            <span className="flex-1 text-sm text-gray-700">{AREA_LABELS[area]}</span>

            {/* Link Button */}
            <button
              onClick={() => startLink(area)}
              className={`p-1.5 rounded transition-colors
                ${linkMode && linkSource === area
                  ? "bg-blue-100 text-blue-600"
                  : linkedAreas[area]
                  ? "text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
                }`}
              title={linkedAreas[area] ? "Linked" : "Link areas"}
            >
              {linkedAreas[area] ? <Link2 size={16} /> : <Unlink size={16} />}
            </button>

            {/* Arrow */}
            <button className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Link Mode Indicator */}
      {linkMode && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-800">
              Select another area to link with <strong>{linkSource && AREA_LABELS[linkSource]}</strong>
            </p>
            <button
              onClick={cancelLink}
              className="text-xs text-amber-600 hover:text-amber-800 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Color Picker */}
      {selectedArea && (
        <div className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {AREA_LABELS[selectedArea]} Color
            </span>
            <button
              onClick={() => setSelectedArea(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Custom Color Input */}
          <div className="flex gap-2">
            <input
              type="color"
              value={colors[selectedArea] || "#2563eb"}
              onChange={(e) => handleColorChange(selectedArea, e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={colors[selectedArea] || "#2563eb"}
              onChange={(e) => handleColorChange(selectedArea, e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg"
              placeholder="#2563eb"
            />
          </div>

          {/* Color Palette */}
          <div className="grid grid-cols-6 gap-1.5">
            {DEFAULT_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(selectedArea, color)}
                className="w-full aspect-square rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> You can link color areas together. If you assign the same color for two areas, they will be merged.
        </p>
      </div>
    </div>
  );
}
