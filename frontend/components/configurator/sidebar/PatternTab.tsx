"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useConfigurator, DEFAULT_COLORS } from "../ConfiguratorContext";
import { ProductArea, PatternConfig } from "@/types/configurator";

/* ======================================================
   PATTERN DEFINITIONS
====================================================== */

const PATTERNS = [
  { id: "stripes", name: "Stripes", svg: createStripePattern },
  { id: "checker", name: "Checker", svg: createCheckerPattern },
  { id: "geometric", name: "Geometric", svg: createGeometricPattern },
  { id: "abstract", name: "Abstract", svg: createAbstractPattern },
  { id: "camo", name: "Camo", svg: createCamoPattern },
  { id: "dots", name: "Dots", svg: createDotsPattern },
  { id: "waves", name: "Waves", svg: createWavesPattern },
  { id: "hexagon", name: "Hexagon", svg: createHexagonPattern },
];

/* Pattern SVG Generators */
function createStripePattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <rect x="0" y="0" width="20" height="40" fill="${color}"/>
    </svg>`
  )}`;
}

function createCheckerPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <rect x="0" y="0" width="20" height="20" fill="${color}"/>
      <rect x="20" y="20" width="20" height="20" fill="${color}"/>
    </svg>`
  )}`;
}

function createGeometricPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <polygon points="20,5 35,20 20,35 5,20" fill="${color}"/>
    </svg>`
  )}`;
}

function createAbstractPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <circle cx="20" cy="20" r="15" fill="${color}"/>
    </svg>`
  )}`;
}

function createCamoPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <ellipse cx="10" cy="10" rx="8" ry="6" fill="${color}"/>
      <ellipse cx="30" cy="30" rx="8" ry="6" fill="${color}"/>
    </svg>`
  )}`;
}

function createDotsPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <circle cx="10" cy="10" r="5" fill="${color}"/>
      <circle cx="30" cy="10" r="5" fill="${color}"/>
      <circle cx="10" cy="30" r="5" fill="${color}"/>
      <circle cx="30" cy="30" r="5" fill="${color}"/>
    </svg>`
  )}`;
}

function createWavesPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <path d="M0 20 Q10 10 20 20 T40 20" stroke="${color}" stroke-width="3" fill="none"/>
    </svg>`
  )}`;
}

function createHexagonPattern(color: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
      <rect width="40" height="40" fill="white"/>
      <polygon points="20,5 32.5,12.5 32.5,27.5 20,35 7.5,27.5 7.5,12.5" stroke="${color}" stroke-width="2" fill="none"/>
    </svg>`
  )}`;
}

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

export default function PatternTab() {
  const {
    patterns,
    setPattern,
    getAreasForProduct,
    selectedProduct,
    setFillType,
  } = useConfigurator();

  const [selectedArea, setSelectedArea] = useState<ProductArea | null>(null);
  const [patternColor, setPatternColor] = useState("#000000");
  const [scale, setScale] = useState(1);
  const [angle, setAngle] = useState(0);

  const areas = getAreasForProduct(selectedProduct);

  const applyPattern = (patternId: string) => {
    if (!selectedArea) return;

    const config: PatternConfig = {
      area: selectedArea,
      patternId,
      scale,
      angle,
      color: patternColor,
    };

    setPattern(selectedArea, config);
    setFillType(selectedArea, "pattern");
  };

  const getPatternPreview = (patternId: string) => {
    const pattern = PATTERNS.find((p) => p.id === patternId);
    return pattern ? pattern.svg(patternColor) : "";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Select pattern</h3>
        <p className="text-xs text-gray-500">Assign a pattern to the areas</p>
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

      {/* Area Selection */}
      {!selectedArea && (
        <div className="space-y-2">
          {areas.map((area) => (
            <button
              key={area}
              onClick={() => setSelectedArea(area)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition-colors"
            >
              <span className="text-sm text-gray-700">{AREA_LABELS[area]}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Pattern Selection */}
      {selectedArea && (
        <>
          {/* Pattern Color */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Pattern Color</label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_COLORS.slice(0, 12).map((color) => (
                <button
                  key={color}
                  onClick={() => setPatternColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${patternColor === color ? "border-blue-500 scale-110" : "border-gray-200"}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Scale Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-700">Scale</label>
              <span className="text-xs text-gray-500">{scale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
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

          {/* Pattern Grid */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Patterns</label>
            <div className="grid grid-cols-4 gap-2">
              {PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => applyPattern(pattern.id)}
                  className="aspect-square rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 transition-colors"
                  title={pattern.name}
                >
                  <img
                    src={getPatternPreview(pattern.id)}
                    alt={pattern.name}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Fill Type Toggle */}
      {selectedArea && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setFillType(selectedArea, "color")}
            className="flex-1 py-1.5 text-xs font-medium rounded text-gray-600 hover:bg-white hover:shadow-sm transition-all"
          >
            Color
          </button>
          <button
            onClick={() => setFillType(selectedArea, "pattern")}
            className="flex-1 py-1.5 text-xs font-medium rounded bg-white shadow-sm text-blue-600"
          >
            Pattern
          </button>
          <button
            onClick={() => setFillType(selectedArea, "gradient")}
            className="flex-1 py-1.5 text-xs font-medium rounded text-gray-600 hover:bg-white hover:shadow-sm transition-all"
          >
            Gradient
          </button>
        </div>
      )}
    </div>
  );
}
