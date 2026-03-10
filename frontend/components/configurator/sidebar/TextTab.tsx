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

export default function TextTab() {
  const { addText, getAreasForProduct, selectedProduct, texts, removeText } = useConfigurator();

  const [text, setText] = useState("");
  const [font, setFont] = useState(FONTS[0]);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(18);
  const [area, setArea] = useState<ProductArea>("front");

  const areas = getAreasForProduct(selectedProduct);
  const customTexts = texts.filter((t) => t.type === "custom");

  const applyText = () => {
    if (!text.trim()) return;

    addText({
      type: "custom",
      text: text,
      fontFamily: font.family,
      fontSize: size,
      color,
      position: { x: 0, y: 0, z: 0.1 },
      rotation: { x: 0, y: 0, z: 0 },
      area,
    });

    setText("");
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Custom Text</h3>
        <p className="text-xs text-gray-500">Add custom text to your design</p>
      </div>

      {/* Text Input */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-700">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 50))}
          placeholder="Enter your text..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <p className="text-xs text-gray-400">{text.length}/50 characters</p>
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
          min="10"
          max="72"
          step="2"
          value={size}
          onChange={(e) => setSize(parseInt(e.target.value))}
          className="w-full accent-blue-600"
        />
      </div>

      {/* Apply Button */}
      <button
        onClick={applyText}
        disabled={!text.trim()}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        Add Text
      </button>

      {/* Added Texts List */}
      {customTexts.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <label className="text-xs font-medium text-gray-700">Added Texts</label>
          <div className="space-y-2">
            {customTexts.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span
                  className="text-sm truncate max-w-[180px]"
                  style={{ color: t.color, fontFamily: t.fontFamily }}
                >
                  {t.text}
                </span>
                <button
                  onClick={() => removeText(t.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
