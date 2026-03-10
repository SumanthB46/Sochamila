"use client";

import { useState } from "react";
import { Download, Grid3x3, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

type Side = "front" | "back" | "left" | "right";

interface BottomBarProps {
  activeSide: Side;
  setActiveSide: (s: Side) => void;
}

export default function BottomBar({
  activeSide,
  setActiveSide,
}: BottomBarProps) {
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);

  const handleZoomIn = () => setZoom(Math.min(zoom + 10, 200));
  const handleZoomOut = () => setZoom(Math.max(zoom - 10, 50));
  const handleReset = () => setZoom(100);

  return (
    <div className="h-16 bg-white border-t flex items-center justify-between px-6 gap-4 flex-wrap">
      {/* Left: Side Selection */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-600 uppercase">Side:</span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["front", "back", "right", "left"] as Side[]).map((side) => (
            <button
              key={side}
              onClick={() => setActiveSide(side)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                activeSide === side
                  ? "bg-teal-600 text-white shadow-md"
                  : "bg-transparent hover:bg-gray-200 text-gray-700"
              }`}
            >
              {side.charAt(0).toUpperCase() + side.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Middle: View Controls */}
      <div className="flex items-center gap-3 border-l border-r px-4 py-1">
        <button
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <span className="text-xs font-medium min-w-10 text-center text-gray-700">{zoom}%</span>
        <button
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
          onClick={handleReset}
          title="Reset Zoom"
        >
          <RotateCcw size={18} />
        </button>
        <button
          className={`p-1.5 rounded transition-colors ${
            showGrid ? "bg-teal-100 text-teal-600" : "hover:bg-gray-100 text-gray-600"
          }`}
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
        >
          <Grid3x3 size={18} />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <span>💾</span> Save
        </button>
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-md">
          <Download size={16} />
          Export PNG
        </button>
      </div>
    </div>
  );
}
