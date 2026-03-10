/* =========================================================
   COMMON
========================================================= */

/** Product sides */
export type Side = "front" | "back" | "left" | "right";

/* =========================================================
   CORE LAYER BASE
========================================================= */

/**
 * Shared properties for all editor layers.
 * This is the single source of truth for positioning & state.
 */
export interface BaseLayer {
  /** Unique layer id */
  readonly id: string;

  /** Discriminant for union narrowing */
  readonly type: LayerType;

  /** Product side */
  side: Side;

  /** Canvas position */
  x: number;
  y: number;

  /** Dimensions */
  width: number;
  height: number;

  /** Transform */
  rotation: number; // degrees
  opacity: number;  // 0 → 1

  /** State */
  locked: boolean;
  visible: boolean;

  /** Render order (higher = top) */
  zIndex: number;
}

/* =========================================================
   LAYER TYPES
========================================================= */

export type LayerType = "text" | "image" | "sticker" | "pattern";

/* =========================================================
   TEXT LAYER
========================================================= */

export type TextAlign = "left" | "center" | "right";
export type TextStyle = "normal" | "shadow" | "outline" | "3d" | "glow" | "emboss" | "neon" | "gradient" | "chrome" | "glass" | "fire" | "wave" | "blur";

export interface TextLayer extends BaseLayer {
  readonly type: "text";

  /* ---------- Content ---------- */
  text: string;

  /* ---------- Typography ---------- */
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;

  /* ---------- Layout ---------- */
  textAlign: TextAlign;
  letterSpacing: number; // px
  lineHeight: number;    // unitless (1.2, 1.5...)

  /* ---------- Effects ---------- */
  textStyle: TextStyle;
  curve: number; // -180 → 180 (SVG arc / warp)

  /* ---------- Shadow Effects ---------- */
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;

  /* ---------- 3D Effects ---------- */
  depth3d?: number; // 0 → 50
  angle3d?: number; // 0 → 360

  /* ---------- Glow Effects ---------- */
  glowColor?: string;
  glowSize?: number; // 0 → 20

  /* ---------- Gradient Text ---------- */
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}

/* =========================================================
   IMAGE LAYER
========================================================= */

export interface ImageLayer extends BaseLayer {
  readonly type: "image";

  /** Image URL (upload / AI / CDN) */
  src: string;

  /** True if generated via AI */
  isAI?: boolean;
}

/* =========================================================
   STICKER LAYER
========================================================= */

export interface StickerLayer extends BaseLayer {
  readonly type: "sticker";

  /** Sticker image source */
  src: string;

  /** Reference to sticker database */
  stickerId?: string;
}

/* =========================================================
   PATTERN LAYER
========================================================= */

export type PatternType = "stripes" | "dots" | "grid" | "diagonal" | "checkerboard" | "waves" | "hexagon" | "triangle" | "crosshatch" | "zigzag" | "chevron" | "polka" | "stars" | "diamond" | "vertical" | "horizontal";

export interface PatternLayer extends BaseLayer {
  readonly type: "pattern";

  /** Pattern type */
  patternType: PatternType;

  /** Pattern colors */
  color1: string;
  color2: string;

  /** Pattern properties */
  scale: number;
  rotation: number;
}

/* =========================================================
   DISCRIMINATED UNION (EDITOR CORE)
========================================================= */

export type EditorLayer =
  | TextLayer
  | ImageLayer
  | StickerLayer
  | PatternLayer;

/* =========================================================
   TYPE GUARDS (SAFE NARROWING)
========================================================= */

export const isTextLayer = (layer: EditorLayer): layer is TextLayer =>
  layer.type === "text";

export const isImageLayer = (layer: EditorLayer): layer is ImageLayer =>
  layer.type === "image";

export const isStickerLayer = (layer: EditorLayer): layer is StickerLayer =>
  layer.type === "sticker";

export const isPatternLayer = (layer: EditorLayer): layer is PatternLayer =>
  layer.type === "pattern";

/* =========================================================
   DESIGN MODEL (SAVE / LOAD)
========================================================= */

/**
 * Represents a saved editor design.
 * Can be persisted to DB or exported.
 */
export interface Design {
  readonly id: string;

  productId: string;
  variantId: string;

  /** All layers across all sides */
  layers: EditorLayer[];

  createdAt?: string;
  updatedAt?: string;
}
