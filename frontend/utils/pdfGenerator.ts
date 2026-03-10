import jsPDF from 'jspdf';

interface DesignElement {
  type: 'text' | 'image' | 'sticker' | 'graphic';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  fontSize?: number;
  color?: string;
}

interface ProductDesign {
  productId: string;
  productName: string;
  frontName?: string;
  elements: DesignElement[];
  previewImages: Record<string, string>; // front, back, left, right
  stickerUrls?: string[];
  graphicUrls?: string[];
}

export class PDFGenerator {
  static async generatePreviewMockup(design: ProductDesign): Promise<Blob> {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(20);
    doc.text(`${design.productName} - Design Preview`, 20, 20);
    
    if (design.frontName) {
      doc.setFontSize(14);
      doc.text(`Front Name: ${design.frontName}`, 20, 30);
    }

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40);

    let yPos = 50;

    // Add design elements summary
    doc.setFontSize(12);
    doc.text('Design Elements:', 20, yPos);
    yPos += 10;

    design.elements.forEach((element, index) => {
      doc.setFontSize(10);
      const elementText = `${index + 1}. ${element.type}: ${element.content.substring(0, 50)}${element.content.length > 50 ? '...' : ''}`;
      doc.text(elementText, 25, yPos);
      yPos += 7;
    });

    yPos += 10;

    // Add preview images
    const imageWidth = 80;
    const imageHeight = 80;
    const sides = ['front', 'back', 'left', 'right'] as const;

    for (let i = 0; i < sides.length; i += 2) {
      const side1 = sides[i];
      const side2 = sides[i + 1];
      
      if (design.previewImages[side1]) {
        try {
          await doc.addImage(
            design.previewImages[side1],
            'PNG',
            20,
            yPos,
            imageWidth,
            imageHeight
          );
        } catch (error) {
          console.warn(`Failed to add ${side1} image to PDF:`, error);
        }
      }

      if (design.previewImages[side2]) {
        try {
          await doc.addImage(
            design.previewImages[side2],
            'PNG',
            110,
            yPos,
            imageWidth,
            imageHeight
          );
        } catch (error) {
          console.warn(`Failed to add ${side2} image to PDF:`, error);
        }
      }

      // Add labels
      doc.setFontSize(10);
      doc.text(side1.charAt(0).toUpperCase() + side1.slice(1), 20, yPos + imageHeight + 5);
      if (side2) {
        doc.text(side2.charAt(0).toUpperCase() + side2.slice(1), 110, yPos + imageHeight + 5);
      }

      yPos += imageHeight + 15;
    }

    // Add sticker/graphics information
    if (design.stickerUrls && design.stickerUrls.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Stickers Used:', 20, yPos);
      yPos += 10;
      
      design.stickerUrls.forEach((url, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`, 25, yPos);
        yPos += 7;
      });
    }

    if (design.graphicUrls && design.graphicUrls.length > 0) {
      yPos += 10;
      doc.setFontSize(12);
      doc.text('Graphics Used:', 20, yPos);
      yPos += 10;
      
      design.graphicUrls.forEach((url, index) => {
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${url.substring(0, 60)}${url.length > 60 ? '...' : ''}`, 25, yPos);
        yPos += 7;
      });
    }

    // Generate blob
    return doc.output('blob');
  }

  static async downloadPDF(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}