"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import { useConfigurator } from "../ConfiguratorContext";
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

export default function LogoTab() {
  const { addLogo, logos, removeLogo, getAreasForProduct, selectedProduct } = useConfigurator();

  const [area, setArea] = useState<ProductArea>("front");
  const [scale, setScale] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const areas = getAreasForProduct(selectedProduct);
  const addedLogos = logos;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const applyLogo = () => {
    if (!preview) return;

    addLogo({
      src: preview,
      position: { x: 0, y: 0, z: 0.1 },
      rotation: { x: 0, y: 0, z: 0 },
      scale,
      area,
    });

    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Logo Upload</h3>
        <p className="text-xs text-gray-500">Upload your team or sponsor logo</p>
      </div>

      {/* File Upload */}
      {!preview && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Click to upload logo</p>
          <p className="text-xs text-gray-400">PNG, JPG up to 2MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}

      {/* Preview */}
      {preview && (
        <div className="space-y-3">
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Logo preview"
              className="w-full h-full object-contain"
            />
            <button
              onClick={cancelPreview}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X size={14} />
            </button>
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

          {/* Scale Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs font-medium text-gray-700">Size</label>
              <span className="text-xs text-gray-500">{scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Apply Button */}
          <button
            onClick={applyLogo}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Logo
          </button>
        </div>
      )}

      {/* Added Logos List */}
      {addedLogos.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <label className="text-xs font-medium text-gray-700">Added Logos</label>
          <div className="space-y-2">
            {addedLogos.map((logo) => (
              <div
                key={logo.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                <img
                  src={logo.src}
                  alt="Logo"
                  className="w-10 h-10 object-contain bg-white rounded"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {AREA_LABELS[logo.area]}
                  </p>
                  <p className="text-xs text-gray-400">{logo.scale.toFixed(1)}x</p>
                </div>
                <button
                  onClick={() => removeLogo(logo.id)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="p-3 bg-amber-50 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Tip:</strong> For best results, use a PNG with transparent background.
        </p>
      </div>
    </div>
  );
}
