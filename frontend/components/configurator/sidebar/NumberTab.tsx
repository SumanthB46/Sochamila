"use client";

import { useState } from "react";
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

const FONTS = [
  { id: "inter", name: "Inter", family: "Inter, sans-serif" },
  { id: "poppins", name: "Poppins", family: "Poppins, sans-serif" },
  { id: "montserrat", name: "Montserrat", family: "Montserrat, sans-serif" },
  { id: "roboto", name: "Roboto", family: "Roboto, sans-serif" },
  { id: "bebas", name: "Bebas Neue", family: "Bebas Neue, sans-serif" },
  { id: "oswald", name: "Oswald", family: "Oswald, sans-serif" },
];

/* ======================================================
   COMPONENT
====================================================== */

export default function NumberTab() {
  const { addText, getAreasForProduct, selectedProduct } = useConfigurator();

  const [number, setNumber] = useState("10");
  const [font, setFont] = useState(FONTS[4]); // Bebas Neue default for numbers
  const [color, setColor] = useState("#ffffff");
  const [size, setSize] = useState(48);
  const [area, setArea] = useState<ProductArea>("back");

  const areas = getAreasForProduct(selectedProduct);

  const applyNumber = () => {
    if (!number.trim()) return;

    addText({
      type: "number",
      text: number,
      fontFamily: font.family,
      fontSize: size,
      color,
      position: { x: 0, y: 0, z: 0.1 },
      rotation: { x: 0, y: 0, z: 0 },
      area,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Player Number</h3>
        <p className="text-xs text-gray-500">Add a number to your jersey</p>
      </div>

      {/* Number Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Number</label>
        <input
          type="text"
          value={number}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 2);
            setNumber(val);
          }}
          placeholder="00"
          className="w-full px-3 py-2 text-2xl font-bold text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-400">Enter a number (0-99)</p>
      </div>

      {/* Placement Area */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Placement</label>
        <select
          value={area}
          onChange={(e) => setArea(e.target.value as ProductArea)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {AREA_LABELS[a]}
            </option>
          ))}
        </select>
      </div>

      {/* Font Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Font Style</label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFont(f)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors
                ${font.id === f.id
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"}`}
              style={{ fontFamily: f.family }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Color Selection */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Color</label>
        <div className="flex gap-2 flex-wrap">
          {DEFAULT_COLORS.slice(0, 12).map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all
                ${color === c ? "border-blue-500 scale-110" : "border-gray-200"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>

      {/* Size Control */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-xs font-medium text-gray-700">Size</label>
          <span className="text-xs text-gray-500">{size}px</span>
        </div>
        <input
          type="range"
          min="24"
          max="120"
          step="4"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Preview */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-xs text-gray-500 mb-2">Preview</p>
        <div
          className="text-center"
          style={{
            fontFamily: font.family,
            fontSize: `${Math.min(size, 64)}px`,
            color,
            fontWeight: "bold",
          }}
        >
          {number || "00"}
        </div>
      </div>

      {/* Apply Button */}
      <button
        onClick={applyNumber}
        disabled={!number.trim()}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Add Number
      </button>
    </div>
  );
}
