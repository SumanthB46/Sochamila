"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Download, Copy, Trash2, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { EditorLayer } from "@/types/editor";

interface LayerPanelProps {
  layers: EditorLayer[];
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  deleteLayer: (id: string) => void;
  updateLayer: (id: string, type: EditorLayer["type"], patch: any) => void;
}

export default function LayerPanel({
  layers,
  selectedLayerId,
  setSelectedLayerId,
  deleteLayer,
  updateLayer,
}: LayerPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div
        className="bg-gray-50 px-4 py-3 border-b cursor-pointer flex items-center justify-between hover:bg-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <ChevronDown size={16} className={`transition-transform ${expanded ? "" : "-rotate-90"}`} />
          Layers ({layers.length})
        </h3>
      </div>

      {expanded && (
        <div className="max-h-64 overflow-y-auto">
          {layers.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No layers yet</div>
          ) : (
            <div className="space-y-1 p-2">
              {[...layers].reverse().map((layer) => (
                <div
                  key={layer.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-colors ${
                    selectedLayerId === layer.id
                      ? "bg-teal-100 border border-teal-400"
                      : "hover:bg-gray-100 border border-transparent"
                  }`}
                  onClick={() => setSelectedLayerId(layer.id)}
                >
                  {/* Visibility Toggle */}
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, layer.type, { visible: !layer.visible });
                    }}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  {/* Lock Toggle */}
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLayer(layer.id, layer.type, { locked: !layer.locked });
                    }}
                  >
                    {layer.locked ? <Lock size={14} /> : <Unlock size={14} />}
                  </button>

                  {/* Layer Name */}
                  <span className="flex-1 truncate font-medium">
                    {layer.type === "text" ? `Text: ${(layer as any).text.slice(0, 15)}...` : `Image`}
                  </span>

                  {/* Delete Button */}
                  <button
                    className="p-1 hover:bg-red-100 hover:text-red-600 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLayer(layer.id);
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
