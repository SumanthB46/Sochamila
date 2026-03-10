"use client";

import React from "react";

type ToolTab = "products" | "designs" | "text" | "upload" | "ai" | "stickers";

interface IconSidebarProps {
  activeTab: ToolTab;
  onTabChange: (tab: ToolTab) => void;
}

const tools: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "products",
    label: "Products",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    id: "designs",
    label: "Designs",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "text",
    label: "Text",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "upload",
    label: "Upload",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    id: "ai",
    label: "AI Design",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    id: "stickers",
    label: "Stickers",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function IconSidebar({ activeTab, onTabChange }: IconSidebarProps) {
  return (
    <aside className="w-16 bg-white border-r flex flex-col items-center py-4 gap-2 shrink-0 h-full overflow-y-auto">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onTabChange(tool.id)}
          className={`w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg transition-all ${
            activeTab === tool.id
              ? "bg-indigo-50 text-indigo-600"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
          title={tool.label}
        >
          {tool.icon}
          <span className="text-[9px] font-medium">{tool.label}</span>
        </button>
      ))}

      <div className="flex-1" />

      {/* Undo */}
      <button
        className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
        title="Undo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <span className="text-[9px] font-medium">Undo</span>
      </button>

      {/* Redo */}
      <button
        className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition"
        title="Redo"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
        </svg>
        <span className="text-[9px] font-medium">Redo</span>
      </button>
    </aside>
  );
}
