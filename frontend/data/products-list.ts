export interface ProductDetail {
  id: number;
  title: string;
  description: string;

  basePrice: number;

  colors: {
    name: string;
    hex: string;
    img: string;
  }[];

  sizes: string[];

  gallery: string[];

  // Add this 👇
  externalProductId?: string | number; // ID from Printful/Vexels/Mockup provider
}
