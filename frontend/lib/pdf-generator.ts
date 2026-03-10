import jsPDF from "jspdf";
import api from "./axios";
import type { EditorLayer, TextLayer, ImageLayer, StickerLayer } from "@/types/editor";

/* ===================================================
   TYPES
=================================================== */

export interface MockupDetails {
    productId: string;
    productName: string;
    previewImages: Record<string, string | null>;
    layers?: EditorLayer[]; // full layer data from editor
}

/* ===================================================
   HELPERS
=================================================== */

function hexBgToRgb(hex: string): [number, number, number] {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.substring(0, 2), 16) || 0;
    const g = parseInt(sanitized.substring(2, 4), 16) || 0;
    const b = parseInt(sanitized.substring(4, 6), 16) || 0;
    return [r, g, b];
}

function cap(str: string, len = 60) {
    return str.length > len ? str.slice(0, len) + "…" : str;
}

function sectionHeader(doc: jsPDF, title: string, y: number): number {
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.roundedRect(15, y, 180, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), 20, y + 5.5);
    doc.setTextColor(0, 0, 0);
    return y + 12;
}

function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 120);
    doc.text(label, x, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 30, 40);
    doc.text(cap(value), x, y + 5);
}

/* ===================================================
   MAIN PDF GENERATOR
=================================================== */

export const PDFGenerator = {
    generatePreviewMockup: async (details: MockupDetails): Promise<Blob> => {
        const doc = new jsPDF("p", "mm", "a4");
        const W = 210; // A4 width mm
        const MARGIN = 15;
        const CONTENT_W = W - MARGIN * 2;
        let y = 15;

        /* ---- Cover Header ---- */
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, W, 30, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text("Custom Design Mockup", W / 2, 13, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(220, 220, 255);
        doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, W / 2, 21, { align: "center" });
        doc.text(`Order for: ${details.productName}`, W / 2, 27, { align: "center" });

        y = 38;

        /* ---- Product Info Row ---- */
        doc.setFillColor(248, 248, 255);
        doc.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "F");
        doc.setDrawColor(200, 200, 230);
        doc.roundedRect(MARGIN, y, CONTENT_W, 18, 3, 3, "S");
        labelValue(doc, "Product ID", details.productId.slice(0, 16) + "…", MARGIN + 4, y + 5);
        labelValue(doc, "Product Name", details.productName, MARGIN + 80, y + 5);
        y += 24;

        /* ---- Helper: add image safely ---- */
        const addImgSafe = async (
            src: string, x: number, iy: number, w: number, h: number
        ) => {
            try {
                if (src.startsWith("data:image")) {
                    const ext = src.split(";")[0].split("/")[1]?.toUpperCase() || "PNG";
                    const fmt = ext === "SVG+XML" ? "SVG" : ext === "JPEG" ? "JPEG" : "PNG";
                    doc.addImage(src, fmt as "PNG" | "JPEG", x, iy, w, h);
                } else {
                    // fetch remote image and convert to data URL
                    const resp = await fetch(src, { mode: "cors" });
                    const blob = await resp.blob();
                    const dataUrl = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                    const ext = dataUrl.split(";")[0].split("/")[1]?.toUpperCase() || "PNG";
                    doc.addImage(dataUrl, ext as "PNG" | "JPEG", x, iy, w, h);
                }
            } catch (e) {
                console.warn("Could not embed image in PDF:", e);
            }
        };

        /* ======================================================
           SECTION 1 — MOCKUP PREVIEWS
        ====================================================== */
        const sides = Object.entries(details.previewImages).filter(([, v]) => v);
        if (sides.length > 0) {
            y = sectionHeader(doc, `📷  Mockup Previews (${sides.length} side${sides.length > 1 ? "s" : ""})`, y);

            for (const [side, imgData] of sides) {
                if (!imgData) continue;
                if (y > 220) { doc.addPage(); y = 20; }

                // Side label
                doc.setFont("helvetica", "bold");
                doc.setFontSize(10);
                doc.setTextColor(79, 70, 229);
                doc.text(`${side.charAt(0).toUpperCase() + side.slice(1)} View`, W / 2, y, { align: "center" });
                y += 4;

                // Image box
                doc.setFillColor(245, 245, 250);
                doc.roundedRect(MARGIN + 20, y, CONTENT_W - 40, 90, 4, 4, "F");
                await addImgSafe(imgData, MARGIN + 25, y + 2, CONTENT_W - 50, 86);
                y += 96;
            }
        }

        /* ======================================================
           SECTION 2 — DESIGN LAYER DETAILS
        ====================================================== */
        if (details.layers && details.layers.length > 0) {
            if (y > 230) { doc.addPage(); y = 20; }

            const textLayers = details.layers.filter(l => l.type === "text") as TextLayer[];
            const imageLayers = details.layers.filter(l => l.type === "image") as ImageLayer[];
            const stickerLayers = details.layers.filter(l => l.type === "sticker") as StickerLayer[];
            const aiLayers = imageLayers.filter(l => l.isAI);
            const uploadedLayers = imageLayers.filter(l => !l.isAI);

            /* ---- TEXT LAYERS ---- */
            if (textLayers.length > 0) {
                y = sectionHeader(doc, `✏️  Text Layers (${textLayers.length})`, y);

                for (let i = 0; i < textLayers.length; i++) {
                    const tl = textLayers[i];
                    if (y > 240) { doc.addPage(); y = 20; }

                    // Card
                    doc.setFillColor(250, 250, 255);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 38, 3, 3, "F");
                    doc.setDrawColor(200, 200, 240);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 38, 3, 3, "S");

                    // Index badge
                    doc.setFillColor(79, 70, 229);
                    doc.circle(MARGIN + 7, y + 7, 4, "F");
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(7);
                    doc.setTextColor(255, 255, 255);
                    doc.text(String(i + 1), MARGIN + 7, y + 8.5, { align: "center" });

                    // Text content (large preview)
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(11);
                    doc.setTextColor(30, 30, 40);
                    doc.text(`"${cap(tl.text, 50)}"`, MARGIN + 14, y + 9);

                    // Side badge
                    doc.setFillColor(224, 231, 255);
                    doc.roundedRect(MARGIN + CONTENT_W - 22, y + 2, 19, 6, 2, 2, "F");
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(7);
                    doc.setTextColor(79, 70, 229);
                    doc.text(tl.side.toUpperCase(), MARGIN + CONTENT_W - 12.5, y + 6, { align: "center" });

                    // Row 1: Font, Size, Weight, Style
                    const row1y = y + 15;
                    labelValue(doc, "Font", tl.fontFamily, MARGIN + 3, row1y);
                    labelValue(doc, "Size", `${tl.fontSize}px`, MARGIN + 45, row1y);
                    labelValue(doc, "Weight", String(tl.fontWeight), MARGIN + 70, row1y);
                    labelValue(doc, "Style", tl.textStyle, MARGIN + 95, row1y);
                    labelValue(doc, "Align", tl.textAlign, MARGIN + 135, row1y);

                    // Row 2: Spacing, Color, Effects
                    const row2y = y + 27;
                    labelValue(doc, "Letter Spacing", `${tl.letterSpacing}px`, MARGIN + 3, row2y);
                    labelValue(doc, "Line Height", String(tl.lineHeight), MARGIN + 55, row2y);

                    // Color swatch
                    doc.text("Color", MARGIN + 90, row2y);
                    const [cr, cg, cb] = hexBgToRgb(tl.color || "#000000");
                    doc.setFillColor(cr, cg, cb);
                    doc.roundedRect(MARGIN + 103, row2y + 1.5, 8, 4, 1, 1, "F");
                    doc.setDrawColor(180, 180, 180);
                    doc.roundedRect(MARGIN + 103, row2y + 1.5, 8, 4, 1, 1, "S");
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(60, 60, 80);
                    doc.text(tl.color || "#000000", MARGIN + 114, row2y + 5);

                    // Modifiers
                    const modifiers = [
                        tl.isItalic && "Italic",
                        tl.isUnderline && "Underline",
                        tl.isStrikethrough && "Strikethrough",
                        tl.curve && tl.curve !== 0 ? `Curve: ${tl.curve}°` : null,
                    ].filter(Boolean).join("  •  ");
                    if (modifiers) {
                        doc.setFont("helvetica", "italic");
                        doc.setFontSize(7.5);
                        doc.setTextColor(100, 100, 150);
                        doc.text(modifiers, MARGIN + 3, row2y + 9);
                    }

                    y += 44;
                }
            }

            /* ---- UPLOADED IMAGE LAYERS ---- */
            if (uploadedLayers.length > 0) {
                if (y > 240) { doc.addPage(); y = 20; }
                y = sectionHeader(doc, `🖼️  Uploaded Images (${uploadedLayers.length})`, y);

                for (let i = 0; i < uploadedLayers.length; i++) {
                    const il = uploadedLayers[i];
                    if (y > 240) { doc.addPage(); y = 20; }

                    doc.setFillColor(250, 255, 250);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "F");
                    doc.setDrawColor(200, 230, 200);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "S");

                    // Thumbnail
                    await addImgSafe(il.src, MARGIN + 3, y + 3, 24, 24);

                    // Details
                    labelValue(doc, "Image URL", il.src, MARGIN + 30, y + 7);
                    labelValue(doc, "Side", il.side, MARGIN + 30, y + 18);
                    labelValue(doc, "Size", `${Math.round(il.width)}×${Math.round(il.height)}px`, MARGIN + 70, y + 18);
                    labelValue(doc, "Opacity", `${Math.round(il.opacity * 100)}%`, MARGIN + 120, y + 18);

                    y += 36;
                }
            }

            /* ---- STICKER LAYERS ---- */
            if (stickerLayers.length > 0) {
                if (y > 240) { doc.addPage(); y = 20; }
                y = sectionHeader(doc, `🎨  Stickers (${stickerLayers.length})`, y);

                for (let i = 0; i < stickerLayers.length; i++) {
                    const sl = stickerLayers[i];
                    if (y > 240) { doc.addPage(); y = 20; }

                    doc.setFillColor(255, 250, 240);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "F");
                    doc.setDrawColor(230, 200, 150);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "S");

                    await addImgSafe(sl.src, MARGIN + 3, y + 3, 24, 24);

                    labelValue(doc, "Sticker", sl.stickerId || "Custom", MARGIN + 30, y + 7);
                    labelValue(doc, "Side", sl.side, MARGIN + 30, y + 18);
                    labelValue(doc, "Size", `${Math.round(sl.width)}×${Math.round(sl.height)}px`, MARGIN + 70, y + 18);
                    labelValue(doc, "Rotation", `${sl.rotation || 0}°`, MARGIN + 120, y + 18);

                    y += 36;
                }
            }

            /* ---- AI GENERATED IMAGES ---- */
            if (aiLayers.length > 0) {
                if (y > 240) { doc.addPage(); y = 20; }
                y = sectionHeader(doc, `🤖  AI Generated Images (${aiLayers.length})`, y);

                for (let i = 0; i < aiLayers.length; i++) {
                    const al = aiLayers[i];
                    if (y > 240) { doc.addPage(); y = 20; }

                    doc.setFillColor(245, 240, 255);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "F");
                    doc.setDrawColor(200, 170, 240);
                    doc.roundedRect(MARGIN, y, CONTENT_W, 30, 3, 3, "S");

                    await addImgSafe(al.src, MARGIN + 3, y + 3, 24, 24);

                    labelValue(doc, "AI Image", `Layer ${i + 1}`, MARGIN + 30, y + 7);
                    labelValue(doc, "Side", al.side, MARGIN + 30, y + 18);
                    labelValue(doc, "URL", cap(al.src, 60), MARGIN + 60, y + 7);

                    y += 36;
                }
            }
        }

        /* ---- Footer ---- */
        const pageCount = (doc as any).internal.getNumberOfPages();
        for (let p = 1; p <= pageCount; p++) {
            doc.setPage(p);
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7.5);
            doc.setTextColor(160, 160, 180);
            doc.text(
                `Sochamila Design Mockup  •  Page ${p} of ${pageCount}  •  Confidential`,
                W / 2, 292, { align: "center" }
            );
        }

        return doc.output("blob");
    },

    uploadPdf: async (pdfBlob: Blob, filename: string): Promise<string> => {
        const formData = new FormData();
        formData.append("file", pdfBlob, filename);

        try {
            const res = await api.post("/uploads", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data?.success && res.data?.url) {
                return res.data.url;
            } else {
                throw new Error("Failed to upload PDF: " + JSON.stringify(res.data));
            }
        } catch (e: any) {
            console.warn("PDF upload failed:", e);
            throw e;
        }
    },
};
