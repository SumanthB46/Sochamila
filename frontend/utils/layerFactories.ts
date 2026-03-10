import { nanoid } from "nanoid";
import {
  Side,
  TextLayer,
  ImageLayer,
  StickerLayer,
} from "@/types/editor";

/* ================= TEXT ================= */

export function createTextLayer(
  side: Side,
  zIndex: number
): TextLayer {
  return {
    id: nanoid(),
    type: "text",          // ✅ FIXED LITERAL
    side,

    text: "Your Text",
    fontFamily: "Inter",
    fontSize: 36,
    fontWeight: 600,
    color: "#000000",
    opacity: 1,
    textAlign: "center",
    letterSpacing: 0,
    lineHeight: 1.2,

    textStyle: "normal",
    curve: 0,
    rotation: 0,
    locked: false,

    x: 40,
    y: 40,
    width: 180,
    height: 60,
    zIndex,
    visible: true,
  };
}

/* ================= IMAGE ================= */

export function createImageLayer(
  side: Side,
  src: string,
  zIndex: number,
  isAI = false
): ImageLayer {
  return {
    id: nanoid(),
    type: "image",         // ✅ FIXED LITERAL
    side,

    src,
    isAI,
    opacity: 1,
    rotation: 0,
    locked: false,

    x: 40,
    y: 40,
    width: 200,
    height: 200,
    zIndex,
    visible: true,
  };
}

/* ================= STICKER ================= */

export function createStickerLayer(
  side: Side,
  src: string,
  zIndex: number
): StickerLayer {
  return {
    id: nanoid(),
    type: "sticker",       // ✅ FIXED LITERAL
    side,

    src,
    opacity: 1,
    rotation: 0,
    locked: false,

    x: 40,
    y: 40,
    width: 120,
    height: 120,
    zIndex,
    visible: true,
  };
}
