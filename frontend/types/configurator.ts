/* =========================================================
   3D PRODUCT CONFIGURATOR TYPES
========================================================= */

export type ProductType = 'jersey' | 'shorts' | 'pants' | 'tracksuit';

export type ProductArea = 
  | 'front'
  | 'back'
  | 'rightSleeve'
  | 'leftSleeve'
  | 'collar'
  | 'element1'
  | 'element2'
  | 'waistband'
  | 'legs';

export type FillType = 'color' | 'pattern' | 'gradient';

/* =========================================================
   COLOR CONFIGURATION
========================================================= */

export interface ColorConfig {
  area: ProductArea;
  color: string;
  linkedAreas?: ProductArea[];
}

/* =========================================================
   PATTERN CONFIGURATION
========================================================= */

export interface PatternConfig {
  area: ProductArea;
  patternId: string;
  scale: number;
  angle: number;
  color?: string;
}

export interface Pattern {
  id: string;
  name: string;
  thumbnail: string;
  svgPattern?: string;
}

/* =========================================================
   GRADIENT CONFIGURATION
========================================================= */

export interface GradientConfig {
  area: ProductArea;
  enabled: boolean;
  startColor: string;
  endColor: string;
  angle: number;
  translate: number;
}

/* =========================================================
   TEXT CONFIGURATION (Number, Name, Custom Text)
========================================================= */

export interface TextConfig {
  id: string;
  type: 'number' | 'name' | 'custom';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  area: ProductArea;
}

/* =========================================================
   LOGO CONFIGURATION
========================================================= */

export interface LogoConfig {
  id: string;
  src: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: number;
  area: ProductArea;
}

/* =========================================================
   DESIGN TEMPLATE
========================================================= */

export interface DesignTemplate {
  id: string;
  name: string;
  thumbnail: string;
  productType: ProductType;
  colors: Record<ProductArea, string>;
  patterns?: Record<ProductArea, PatternConfig>;
}

/* =========================================================
   CONFIGURATOR STATE
========================================================= */

export interface ConfiguratorState {
  // Product Selection
  selectedProduct: ProductType;
  
  // Fill Types per Area
  fillTypes: Record<ProductArea, FillType>;
  
  // Color Configuration
  colors: Record<ProductArea, string>;
  linkedAreas: Record<string, ProductArea[]>;
  
  // Pattern Configuration
  patterns: Record<ProductArea, PatternConfig | null>;
  
  // Gradient Configuration
  gradients: Record<ProductArea, GradientConfig | null>;
  
  // Text Elements
  texts: TextConfig[];
  
  // Logos
  logos: LogoConfig[];
  
  // History for Undo/Redo
  history: ConfiguratorHistoryState[];
  historyIndex: number;
}

export interface ConfiguratorHistoryState {
  colors: Record<ProductArea, string>;
  patterns: Record<ProductArea, PatternConfig | null>;
  gradients: Record<ProductArea, GradientConfig | null>;
  texts: TextConfig[];
  logos: LogoConfig[];
}

/* =========================================================
   SIDEBAR TAB TYPES
========================================================= */

export type SidebarTab = 
  | 'color'
  | 'pattern'
  | 'gradient'
  | 'number'
  | 'name'
  | 'text'
  | 'logo';

export interface TabConfig {
  id: SidebarTab;
  label: string;
  icon: string;
}

/* =========================================================
   3D VIEWER TYPES
========================================================= */

export interface ViewerSettings {
  autoRotate: boolean;
  showShadows: boolean;
  backgroundColor: string;
}

/* =========================================================
   MATERIAL TYPES
========================================================= */

export interface MaterialConfig {
  color?: string;
  map?: string;
  roughness: number;
  metalness: number;
  transparent: boolean;
  opacity: number;
}
