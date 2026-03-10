"use client";

import {
  Shirt,
  Grid3X3,
  Layers,
  Type,
  User,
  Hash,
  ImageIcon,
  Undo2,
  Redo2,
} from "lucide-react";

import { useConfigurator } from "./ConfiguratorContext";
import { SidebarTab } from "@/types/configurator";

/* ======================================================
   TAB CONFIGURATION
====================================================== */

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { id: "color", label: "Color", icon: <Shirt size={18} /> },
  { id: "pattern", label: "Pattern", icon: <Grid3X3 size={18} /> },
  { id: "gradient", label: "Gradient", icon: <Layers size={18} /> },
  { id: "number", label: "Number", icon: <Hash size={18} /> },
  { id: "name", label: "Name", icon: <User size={18} /> },
  { id: "text", label: "Text", icon: <Type size={18} /> },
  { id: "logo", label: "Logo", icon: <ImageIcon size={18} /> },
];

/* ======================================================
   MAIN SIDEBAR COMPONENT - Narrow tabs only
====================================================== */

export default function Sidebar() {
  const { activeTab, setActiveTab, canUndo, canRedo, undo, redo } = useConfigurator();

  return (
    <div className="w-[72px] h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Tab Navigation - Icon only */}
      <div className="flex flex-col py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label}
            className={`flex items-center justify-center py-3 mx-1 rounded-lg transition-colors
              ${
                activeTab === tab.id
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Undo/Redo Controls */}
      <div className="border-t border-gray-200 py-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          title="Undo"
          className={`w-full flex items-center justify-center py-3 transition-colors
            ${
              canUndo
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          title="Redo"
          className={`w-full flex items-center justify-center py-3 transition-colors
            ${
              canRedo
                ? "text-gray-600 hover:bg-gray-100"
                : "text-gray-300 cursor-not-allowed"
            }`}
        >
          <Redo2 size={18} />
        </button>
      </div>
    </div>
  );
}
