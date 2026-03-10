"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadGoogleFont = loadGoogleFont;
const loadedFonts = new Set();
function loadGoogleFont(fontFamily, weights = "400;700") {
    if (loadedFonts.has(fontFamily))
        return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@${weights}&display=swap`;
    document.head.appendChild(link);
    loadedFonts.add(fontFamily);
}
