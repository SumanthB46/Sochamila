"use client";

import { useState, useEffect } from "react";

interface StickerGridProps {
  onStickerSelect?: (src: string) => void;
}

export default function StickerGrid({ onStickerSelect }: StickerGridProps) {
  const [stickers, setStickers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default stickers - in production, load from API
    setStickers([
      "/stickers/star.svg",
      "/stickers/heart.svg",
      "/stickers/crown.svg",
      "/stickers/flower.svg",
      "/stickers/smile.svg",
      "/stickers/check.svg",
    ]);
    setLoading(false);
  }, []);

  const handleStickerClick = (src: string) => {
    if (onStickerSelect) {
      onStickerSelect(src);
    }
  };

  if (loading) {
    return <div className="text-center text-sm text-gray-500 py-4">Loading stickers…</div>;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-700 uppercase">Stickers</h4>
      <div className="grid grid-cols-3 gap-2">
        {stickers.map((s) => (
          <button
            key={s}
            onClick={() => handleStickerClick(s)}
            className="border-2 border-gray-200 rounded-lg p-2 cursor-pointer hover:border-teal-500 hover:shadow-md transition-all active:scale-95 bg-white"
            title={s.split("/").pop()?.replace(".svg", "")}
          >
            <img src={s} alt="sticker" className="w-full h-12 object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
