"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGoogleFont = loadGoogleFont;
const loadedFonts = new Set();
// Map font names to their required subsets for regional languages
const FONT_SUBSET_MAP = {
    "Noto Sans Devanagari": ["devanagari", "latin"],
    "Noto Serif Devanagari": ["devanagari", "latin"],
    "Noto Sans Tamil": ["tamil", "latin"],
    "Noto Serif Tamil": ["tamil", "latin"],
    "Noto Sans Telugu": ["telugu", "latin"],
    "Noto Serif Telugu": ["telugu", "latin"],
    "Noto Sans Kannada": ["kannada", "latin"],
    "Noto Serif Kannada": ["kannada", "latin"],
    "Noto Sans Malayalam": ["malayalam", "latin"],
    "Noto Serif Malayalam": ["malayalam", "latin"],
    "Noto Sans Gujarati": ["gujarati", "latin"],
    "Noto Serif Gujarati": ["gujarati", "latin"],
    "Noto Sans Bengali": ["bengali", "latin"],
    "Noto Serif Bengali": ["bengali", "latin"],
    "Noto Sans Gurmukhi": ["gurmukhi", "latin"],
    "Noto Sans JP": ["japanese"],
    "Noto Serif JP": ["japanese"],
    "Noto Sans SC": ["chinese-simplified"],
    "Noto Serif SC": ["chinese-simplified"],
    "Noto Sans KR": ["korean"],
    "Noto Serif KR": ["korean"],
    "Noto Sans Arabic": ["arabic", "latin"],
    "Noto Serif Arabic": ["arabic", "latin"],
    "Noto Sans Thai": ["thai", "latin"],
    "Noto Serif Thai": ["thai", "latin"],
    "Mukta Vaani": ["devanagari", "latin"],
};
function loadGoogleFont(fontFamily, weights = "400;700") {
    if (loadedFonts.has(fontFamily))
        return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.type = "text/css";
    const family = fontFamily.replace(/ /g, "+");
    // Get the subsets for this font
    const subsets = FONT_SUBSET_MAP[fontFamily];
    const subsetParam = subsets && subsets.length > 0 ? `&subset=${subsets.join(",")}` : "";
    link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900${subsetParam}&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontFamily);
}
