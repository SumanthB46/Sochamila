"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

import {
  ProductType,
  ProductArea,
  FillType,
  ColorConfig,
  PatternConfig,
  GradientConfig,
  TextConfig,
  LogoConfig,
  ConfiguratorState,
  ConfiguratorHistoryState,
  SidebarTab,
  Pattern,
} from "@/types/configurator";

/* ======================================================
   DEFAULT PATTERNS
====================================================== */

export const DEFAULT_PATTERNS: Pattern[] = [
  { id: "stripes", name: "Stripes", thumbnail: "/patterns/stripes.png" },
  { id: "checker", name: "Checker", thumbnail: "/patterns/checker.png" },
  { id: "geometric", name: "Geometric", thumbnail: "/patterns/geometric.png" },
  { id: "abstract", name: "Abstract", thumbnail: "/patterns/abstract.png" },
  { id: "camo", name: "Camouflage", thumbnail: "/patterns/camo.png" },
  { id: "dots", name: "Dots", thumbnail: "/patterns/dots.png" },
  { id: "waves", name: "Waves", thumbnail: "/patterns/waves.png" },
  { id: "hexagon", name: "Hexagon", thumbnail: "/patterns/hexagon.png" },
];

/* ======================================================
   DEFAULT COLORS
====================================================== */

export const DEFAULT_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#ffffff",
  "#f3f4f6", "#d1d5db", "#9ca3af", "#6b7280", "#374151", "#1f2937",
  "#111827", "#000000", "#7f1d1d", "#713f12", "#14532d", "#1e3a8a",
];

/* ======================================================
   PRODUCT AREAS
====================================================== */

export const PRODUCT_AREAS: Record<ProductType, ProductArea[]> = {
  jersey: ["front", "back", "leftSleeve", "rightSleeve", "collar", "element1"],
  shorts: ["front", "back", "waistband", "legs", "element1"],
  pants: ["front", "back", "waistband", "legs", "element1"],
  tracksuit: ["front", "back", "leftSleeve", "rightSleeve", "collar", "waistband", "legs"],
};

/* ======================================================
   INITIAL STATE
====================================================== */

const createInitialState = (): ConfiguratorState => {
  const areas = PRODUCT_AREAS.jersey;
  
  const fillTypes = {} as Record<ProductArea, FillType>;
  const colors = {} as Record<ProductArea, string>;
  const patterns = {} as Record<ProductArea, PatternConfig | null>;
  const gradients = {} as Record<ProductArea, GradientConfig | null>;
  
  areas.forEach((area) => {
    fillTypes[area] = "color";
    colors[area] = "#2563eb";
    patterns[area] = null;
    gradients[area] = null;
  });
  
  return {
    selectedProduct: "jersey",
    fillTypes,
    colors,
    linkedAreas: {},
    patterns,
    gradients,
    texts: [],
    logos: [],
    history: [],
    historyIndex: -1,
  };
};

/* ======================================================
   CONTEXT TYPE
====================================================== */

interface ConfiguratorContextType extends ConfiguratorState {
  // Actions
  setSelectedProduct: (product: ProductType) => void;
  setFillType: (area: ProductArea, type: FillType) => void;
  setColor: (area: ProductArea, color: string) => void;
  linkAreas: (source: ProductArea, targets: ProductArea[]) => void;
  unlinkArea: (area: ProductArea) => void;
  setPattern: (area: ProductArea, config: PatternConfig | null) => void;
  setGradient: (area: ProductArea, config: GradientConfig | null) => void;
  addText: (config: Omit<TextConfig, "id">) => void;
  updateText: (id: string, config: Partial<TextConfig>) => void;
  removeText: (id: string) => void;
  addLogo: (config: Omit<LogoConfig, "id">) => void;
  updateLogo: (id: string, config: Partial<LogoConfig>) => void;
  removeLogo: (id: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  
  // Current Tab
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  
  // Helpers
  getAreasForProduct: (product: ProductType) => ProductArea[];
  canUndo: boolean;
  canRedo: boolean;
}

/* ======================================================
   CONTEXT
====================================================== */

const ConfiguratorContext = createContext<ConfiguratorContextType | undefined>(
  undefined
);

/* ======================================================
   PROVIDER
====================================================== */

export function ConfiguratorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ConfiguratorState>(createInitialState());
  const [activeTab, setActiveTab] = useState<SidebarTab>("color");
  /* ================= HELPERS ================= */

  const getAreasForProduct = useCallback((product: ProductType): ProductArea[] => {
    return PRODUCT_AREAS[product];
  }, []);

  const saveToHistory = useCallback((currentState: ConfiguratorState) => {
    const historyState: ConfiguratorHistoryState = {
      colors: { ...currentState.colors },
      patterns: { ...currentState.patterns },
      gradients: { ...currentState.gradients },
      texts: [...currentState.texts],
      logos: [...currentState.logos],
    };

    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(historyState);
      
      // Limit history to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        ...prev,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  /* ================= ACTIONS ================= */

  const setSelectedProduct = useCallback((product: ProductType) => {
    setState((prev) => {
      const areas = getAreasForProduct(product);
      
      const fillTypes = {} as Record<ProductArea, FillType>;
      const colors = {} as Record<ProductArea, string>;
      const patterns = {} as Record<ProductArea, PatternConfig | null>;
      const gradients = {} as Record<ProductArea, GradientConfig | null>;
      
      areas.forEach((area) => {
        fillTypes[area] = "color";
        colors[area] = "#2563eb";
        patterns[area] = null;
        gradients[area] = null;
      });
      
      return {
        ...prev,
        selectedProduct: product,
        fillTypes,
        colors,
        patterns,
        gradients,
      };
    });
  }, [getAreasForProduct]);

  const setFillType = useCallback((area: ProductArea, type: FillType) => {
    setState((prev) => ({
      ...prev,
      fillTypes: { ...prev.fillTypes, [area]: type },
    }));
  }, []);

  const setColor = useCallback((area: ProductArea, color: string) => {
    setState((prev) => {
      const newColors = { ...prev.colors, [area]: color };
      
      // Apply to linked areas
      const linked = prev.linkedAreas[area];
      if (linked) {
        linked.forEach((linkedArea) => {
          newColors[linkedArea] = color;
        });
      }

      return { ...prev, colors: newColors };
    });
  }, []);

  const linkAreas = useCallback((source: ProductArea, targets: ProductArea[]) => {
    setState((prev) => ({
      ...prev,
      linkedAreas: { ...prev.linkedAreas, [source]: targets },
    }));
  }, []);

  const unlinkArea = useCallback((area: ProductArea) => {
    setState((prev) => {
      const newLinked = { ...prev.linkedAreas };
      delete newLinked[area];
      return { ...prev, linkedAreas: newLinked };
    });
  }, []);

  const setPattern = useCallback((area: ProductArea, config: PatternConfig | null) => {
    setState((prev) => ({
      ...prev,
      patterns: { ...prev.patterns, [area]: config },
    }));
  }, []);

  const setGradient = useCallback((area: ProductArea, config: GradientConfig | null) => {
    setState((prev) => ({
      ...prev,
      gradients: { ...prev.gradients, [area]: config },
    }));
  }, []);

  const addText = useCallback((config: Omit<TextConfig, "id">) => {
    const newText: TextConfig = {
      ...config,
      id: `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState((prev) => ({
      ...prev,
      texts: [...prev.texts, newText],
    }));
  }, []);

  const updateText = useCallback((id: string, config: Partial<TextConfig>) => {
    setState((prev) => ({
      ...prev,
      texts: prev.texts.map((t) => (t.id === id ? { ...t, ...config } : t)),
    }));
  }, []);

  const removeText = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      texts: prev.texts.filter((t) => t.id !== id),
    }));
  }, []);

  const addLogo = useCallback((config: Omit<LogoConfig, "id">) => {
    const newLogo: LogoConfig = {
      ...config,
      id: `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setState((prev) => ({
      ...prev,
      logos: [...prev.logos, newLogo],
    }));
  }, []);

  const updateLogo = useCallback((id: string, config: Partial<LogoConfig>) => {
    setState((prev) => ({
      ...prev,
      logos: prev.logos.map((l) => (l.id === id ? { ...l, ...config } : l)),
    }));
  }, []);

  const removeLogo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      logos: prev.logos.filter((l) => l.id !== id),
    }));
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      
      const newIndex = prev.historyIndex - 1;
      const historyState = prev.history[newIndex];
      
      return {
        ...prev,
        colors: { ...historyState.colors },
        patterns: { ...historyState.patterns },
        gradients: { ...historyState.gradients },
        texts: [...historyState.texts],
        logos: [...historyState.logos],
        historyIndex: newIndex,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      const newIndex = prev.historyIndex + 1;
      const historyState = prev.history[newIndex];
      
      return {
        ...prev,
        colors: { ...historyState.colors },
        patterns: { ...historyState.patterns },
        gradients: { ...historyState.gradients },
        texts: [...historyState.texts],
        logos: [...historyState.logos],
        historyIndex: newIndex,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setState(createInitialState());
  }, []);

  /* ================= COMPUTED ================= */

  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  /* ================= CONTEXT VALUE ================= */

  const value: ConfiguratorContextType = {
    ...state,
    activeTab,
    setActiveTab,
    setSelectedProduct,
    setFillType,
    setColor,
    linkAreas,
    unlinkArea,
    setPattern,
    setGradient,
    addText,
    updateText,
    removeText,
    addLogo,
    updateLogo,
    removeLogo,
    undo,
    redo,
    reset,
    getAreasForProduct,
    canUndo,
    canRedo,
  };

  return (
    <ConfiguratorContext.Provider value={value}>
      {children}
    </ConfiguratorContext.Provider>
  );
}

/* ======================================================
   HOOK
====================================================== */

export function useConfigurator() {
  const context = useContext(ConfiguratorContext);
  if (context === undefined) {
    throw new Error("useConfigurator must be used within a ConfiguratorProvider");
  }
  return context;
}
