"use client";

import { ChevronDown, Info, Shirt, Grid3X3, Layers, Hash, User, Type, ImageIcon } from "lucide-react";
import { useConfigurator } from "./ConfiguratorContext";
import { ProductType, SidebarTab } from "@/types/configurator";

import ColorTab from "./sidebar/ColorTab";
import PatternTab from "./sidebar/PatternTab";
import GradientTab from "./sidebar/GradientTab";
import NumberTab from "./sidebar/NumberTab";
import NameTab from "./sidebar/NameTab";
import TextTab from "./sidebar/TextTab";
import LogoTab from "./sidebar/LogoTab";

const PRODUCT_TYPES: { id: ProductType; label: string; description: string }[] = [
  { id: "jersey", label: "Jersey", description: "Short sleeve sports jersey" },
  { id: "shorts", label: "Shorts", description: "Athletic shorts" },
  { id: "pants", label: "Pants", description: "Long athletic pants" },
  { id: "tracksuit", label: "Tracksuit", description: "Full tracksuit set" },
];

const DESIGN_TEMPLATES = [
  { id: "classic", name: "Classic", colors: ["#2563eb", "#1e40af"] },
  { id: "striped", name: "Striped", colors: ["#dc2626", "#ffffff"] },
  { id: "gradient", name: "Gradient", colors: ["#7c3aed", "#2563eb"] },
  { id: "minimal", name: "Minimal", colors: ["#111827", "#f3f4f6"] },
];

const TAB_HEADERS: Record<SidebarTab, { title: string; icon: React.ReactNode }> = {
  color: { title: "Color", icon: <Shirt size={18} /> },
  pattern: { title: "Pattern", icon: <Grid3X3 size={18} /> },
  gradient: { title: "Gradient", icon: <Layers size={18} /> },
  number: { title: "Number", icon: <Hash size={18} /> },
  name: { title: "Name", icon: <User size={18} /> },
  text: { title: "Text", icon: <Type size={18} /> },
  logo: { title: "Logo", icon: <ImageIcon size={18} /> },
};

function TabContent({ activeTab }: { activeTab: SidebarTab }) {
  switch (activeTab) {
    case "color":
      return <ColorTab />;
    case "pattern":
      return <PatternTab />;
    case "gradient":
      return <GradientTab />;
    case "number":
      return <NumberTab />;
    case "name":
      return <NameTab />;
    case "text":
      return <TextTab />;
    case "logo":
      return <LogoTab />;
    default:
      return <ColorTab />;
  }
}

export default function RightPanel() {
  const { activeTab, selectedProduct, setSelectedProduct } = useConfigurator();
  const tabHeader = TAB_HEADERS[activeTab];

  return (
    <div className="w-[320px] h-full bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Dynamic Header based on active tab */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-blue-600">{tabHeader.icon}</span>
          <h2 className="text-lg font-semibold text-gray-900">{tabHeader.title}</h2>
        </div>
        <p className="text-xs text-gray-500">
          Customize the {tabHeader.title.toLowerCase()} of your product
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Active Tab Content */}
        <div className="p-4 border-b border-gray-200">
          <TabContent activeTab={activeTab} />
        </div>

        {/* Design Templates */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Design Templates</h3>
          <div className="space-y-2">
            {DESIGN_TEMPLATES.map((template) => (
              <button
                key={template.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex -space-x-1">
                  {template.colors.map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border-2 border-white"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{template.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Type */}
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Product Type</h3>
          <div className="relative">
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value as ProductType)}
              className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PRODUCT_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {PRODUCT_TYPES.find(p => p.id === selectedProduct)?.description}
          </p>
        </div>

        {/* Quick Tips */}
        <div className="p-4">
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p>
              Use the tabs on the left to switch between customization options. Changes are applied in real-time to the 3D preview.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
