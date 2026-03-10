/**
 * Keyboard shortcuts and utilities for the editor
 */

export interface KeyboardShortcuts {
  "Ctrl+Z": string; // Undo
  "Ctrl+Shift+Z": string; // Redo
  "Ctrl+C": string; // Copy
  "Ctrl+V": string; // Paste
  "Ctrl+D": string; // Duplicate
  "Delete": string; // Delete layer
  "Escape": string; // Deselect
  "Ctrl+A": string; // Select all
}

export const EDITOR_SHORTCUTS: KeyboardShortcuts = {
  "Ctrl+Z": "Undo",
  "Ctrl+Shift+Z": "Redo",
  "Ctrl+C": "Copy layer",
  "Ctrl+V": "Paste layer",
  "Ctrl+D": "Duplicate layer",
  "Delete": "Delete layer",
  "Escape": "Deselect",
  "Ctrl+A": "Select all layers",
};

/**
 * Generate a download filename with timestamp
 */
export const generateExportFilename = (productName: string = "design"): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `${productName}-${timestamp}.png`;
};

/**
 * Download canvas image
 */
export const downloadDesign = async (
  canvasRef: React.RefObject<HTMLDivElement>,
  filename: string = "design.png"
): Promise<void> => {
  if (!canvasRef.current) return;

  try {
    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: null });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = filename;
    link.click();
  } catch (err) {
    console.error("Failed to download design:", err);
  }
};

/**
 * Copy design to clipboard
 */
export const copyDesignToClipboard = async (
  canvasRef: React.RefObject<HTMLDivElement>
): Promise<void> => {
  if (!canvasRef.current) return;

  try {
    const html2canvas = (await import("html2canvas-pro")).default;
    const canvas = await html2canvas(canvasRef.current, { backgroundColor: null });
    canvas.toBlob((blob) => {
      if (!blob) return;
      navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
    });
  } catch (err) {
    console.error("Failed to copy design:", err);
  }
};
