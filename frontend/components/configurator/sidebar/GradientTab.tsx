"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useConfigurator, DEFAULT_COLORS } from "../ConfiguratorContext";
import { ProductArea, GradientConfig } from "@/types/configurator";

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

export default function GradientTab() {
  const {
    gradients,
    setGradient,
    getAreasForProduct,
    selectedProduct,
    setFillType,
  } = useConfigurator();

  const [selectedArea, setSelectedArea] = useState<ProductArea | null>(null);
  const [startColor, setStartColor] = useState("#2563eb");
  const [endColor, setEndColor] = useState("#60a5fa");
  const [angle, setAngle] = useState(0);
  const [translate, setTranslate] = useState(0);

  const areas = getAreasForProduct(selectedProduct);

  const applyGradient = () => {
    if (!selectedArea) return;

    const config: GradientConfig = {
      area: selectedArea,
      enabled: true,
      startColor,
      endColor,
      angle,
      translate,
    };

    setGradient(selectedArea, config);
    setFillType(selectedArea, "gradient");
  };

  const toggleGradient = (area: ProductArea, enabled: boolean) => {
    const existing = gradients[area];
    if (existing) {
      setGradient(area, { ...existing, enabled });
    } else if (enabled) {
      setGradient(area, {
        area,
        enabled: true,
        startColor,
        endColor,
        angle,
        translate,
      });
    }
    if (enabled) {
      setFillType(area, "gradient");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Determine color gradients</h3>
        <p className="text-xs text-gray-500">Select an area and add a gradient</p>
      </div>

      {/* Back Button if area selected */}
      {selectedArea && (
        <button
          onClick={() => setSelectedArea(null)}
          className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft size={14} />
          Back to areas
        </button>
      )}

      {/* Area List with Toggles */}
      {!selectedArea && (
        <div className="space-y-2">
          {areas.map((area) => {
            const gradient = gradients[area];
            const isEnabled = gradient?.enabled ?? false;

            return (
              <div
                key={area}
                className="flex items-center justify-between p-3 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  {/* Color Preview */}
                  <div
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{
                      background: isEnabled
                        ? `linear-gradient(${gradient?.angle || 0}deg, ${gradient?.startColor || startColor}, ${gradient?.endColor || endColor})`
                        : "#e5e7eb",
                    }}
                  />
                  <span className="text-sm text-gray-700">{AREA_LABELS[area]}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Toggle Switch */}
                  <button
                    onClick={() => toggleGradient(area, !isEnabled)}
                    className={`relative w-11 h-6 rounded-full transition-colors
                      ${isEnabled ? "bg-blue-600" : "bg-gray-200"}`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                        ${isEnabled ? "translate-x-5" : "translate-x-0"}`}
                    />
                  </button>

                  {/* Edit Button */}
                  {isEnabled && (
                    <button
                      onClick={() => {
                        setSelectedArea(area);
                        if (gradient) {
                          setStartColor(gradient.startColor);
                          setEndColor(gradient.endColor);
                          setAngle(gradient.angle);
                          setTranslate(gradient.translate);
                        }
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Gradient Editor */}
      {selectedArea && (
        <>
          {/* Gradient Preview */}
          <div
            className="h-20 rounded-lg border border-gray-200"
            style={{
              background: `linear-gradient(${angle}deg, ${startColor}, ${endColor})`,
            }}
          />

          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700">Start Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={startColor}
                    onChange={(e) => setStartColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={startColor}
                    onChange={(e) => setStartColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-gray-700">End Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={endColor}
                    onChange={(e) => setEndColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={endColor}
                    onChange={(e) => setEndColor(e.target.value)}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Color Palettes */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Quick Colors</label>
              <div className="grid grid-cols-8 gap-1">
                {DEFAULT_COLORS.slice(0, 16).map((color) => (
                  <button
                    key={color}
                    onClick={() => setStartColor(color)}
                    className="w-full aspect-square rounded border border-gray-200 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Translate Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-700">Translate</label>
              <span className="text-xs text-gray-500">{translate}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={translate}
              onChange={(e) => setTranslate(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Angle Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-700">Angle</label>
              <span className="text-xs text-gray-500">{angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={applyGradient}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Gradient
          </button>
        </>
      )}
    </div>
  );
}
