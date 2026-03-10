/* ================= IMAGE VIEW ================= */

export type VariantImageView = "FRONT" | "BACK" | "LEFT" | "RIGHT";

/* ================= VARIANT IMAGE ================= */

export interface ProductVariantImage {
  id: string;
  view: VariantImageView;

  /**
   * Public image path
   * Example: /uploads/products/abc123.png
   */
  image: string;
}

/* ================= PRODUCT VARIANT ================= */

export interface ProductVariant {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;

  images: ProductVariantImage[];
}

/* ================= PRODUCT ================= */

export interface Product {
  id: string;
  name: string;
  description?: string | null;

  gender: "MEN" | "WOMEN" | "KIDS" | "UNISEX";
  department: "CLOTHING" | "ACCESSORIES" | "FOOTWEAR" | "HOME_LIVING" | "GEAR";
  productType:
  | "TSHIRT"
  | "SHIRT"
  | "HOODIE"
  | "SWEATSHIRT"
  | "JACKET"
  | "CAP"
  | "MUG"
  | "BAG"
  | "PHONE_CASE";

  /**
   * Thumbnail used for listing pages
   * Example: /uploads/products/thumb.png
   */
  thumbnail: string;

  /**
   * Minimum price across all variants
   */
  minPrice: number;

  isActive: boolean;
  isAvailable: boolean;

  shippingPolicy?: string;
  returnPolicy?: string;

  variants: ProductVariant[];
}
