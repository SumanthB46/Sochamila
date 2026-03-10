import { TextStyle } from "./editor";

export interface TextOptions {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  opacity: number;
  letterSpacing: number;
  lineHeight: number;
  textStyle: TextStyle;
  curve: number;

  // Text decorations
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;

  // Shadow effects
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  shadowBlur?: number;

  // 3D effects
  depth3d?: number;
  angle3d?: number;

  // Glow effects
  glowColor?: string;
  glowSize?: number;

  // Gradient text
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number;
}
