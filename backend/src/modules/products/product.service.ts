import { prisma } from "../../config/prisma";

/* ======================================================
   TYPES
====================================================== */

const VIEW_BY_ORDER = ["FRONT", "BACK", "RIGHT", "LEFT"] as const;

export type Variant = {
  id: string;
  color: string;
  size: string;
  price: number;
  stock: number;
  images: {
    image: string;
    view: string;
  }[];
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  gender: string;
  department: string;
  productType: string;
  thumbnail: string | null;
  minPrice: number;
  variants: Variant[];
};

/* ======================================================
   FORMAT PRODUCT FOR SHOP FRONTEND
====================================================== */

const formatProduct = (product: any): ShopProduct => {
  // Product-level images with view by order (for fallback)
  const productImages = (product.images ?? [])
    .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((img: any, index: number) => ({
      image: img.imageUrl,
      view: VIEW_BY_ORDER[index] ?? VIEW_BY_ORDER[0],
    }));

  const variants: Variant[] =
    product.colors?.flatMap((color: any) =>
      color.sizes?.map((size: any) => {
        // Color images: assign view by sortOrder (0=FRONT, 1=BACK, 2=LEFT, 3=RIGHT)
        const colorImages = (color.images ?? [])
          .sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((img: any, index: number) => ({
            image: img.imageUrl,
            view: VIEW_BY_ORDER[index] ?? VIEW_BY_ORDER[0],
          }));

        return {
          id: size.id,
          color: color.name,
          size: size.size,
          price: Number(size.price),
          stock: Number(size.stock),
          images: colorImages.length > 0 ? colorImages : productImages,
        };
      }) ?? []
    ) ?? [];

  const minPrice =
    variants.length > 0
      ? Math.min(...variants.map(v => v.price))
      : 0;

  // Use first product image as thumbnail
  const thumbnail = product.images?.[0]?.imageUrl ?? null;

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    gender: product.gender,
    department: product.department,
    productType: product.productType,
    thumbnail,
    minPrice,
    variants,
  };
};

/* ======================================================
   GET ALL PUBLIC PRODUCTS (SHOP PAGE)
====================================================== */

export const getAllPublicProducts = async (
  page = 1,
  limit = 10
): Promise<{ items: ShopProduct[]; total: number }> => {
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where: {
        isActive: true,
        isAvailable: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip,
      include: {
        // Product-level images
        images: {
          orderBy: { sortOrder: "asc" },
        },
        colors: {
          include: {
            // Color-specific images
            images: {
              orderBy: { sortOrder: "asc" },
            },
            sizes: {
              where: {
                isActive: true,
                stock: { gt: 0 },
              },
              orderBy: {
                price: "asc",
              },
            },
          },
        },
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        isAvailable: true,
      },
    }),
  ]);

  return { items: products.map(formatProduct), total };
};

/* ======================================================
   GET SINGLE PRODUCT (DETAIL PAGE)
====================================================== */

export const getPublicProductById = async (
  id: string
): Promise<ShopProduct | null> => {
  if (!id) return null;

  const product = await prisma.product.findFirst({
    where: {
      id,
      isActive: true,
      isAvailable: true,
    },
    include: {
      // Product-level images
      images: {
        orderBy: { sortOrder: "asc" },
      },
      colors: {
        include: {
          // Color-specific images
          images: {
            orderBy: { sortOrder: "asc" },
          },
          sizes: {
            where: {
              isActive: true,
              stock: { gt: 0 },
            },
            orderBy: {
              price: "asc",
            },
          },
        },
      },
    },
  });

  return product ? formatProduct(product) : null;
};

/* ======================================================
   GET SIZE BY ID (for checkout page)
====================================================== */

export const getSizeById = async (
  sizeId: string
): Promise<{ id: string; sizeId: string; size: string; price: number } | null> => {
  if (!sizeId) return null;

  const size = await prisma.productSize.findUnique({
    where: { id: sizeId },
    select: {
      id: true,
      size: true,
      price: true,
      sku: true,
    },
  });

  if (!size) return null;

  return {
    id: size.id,
    sizeId: size.id, // Include both for compatibility
    size: size.size,
    price: size.price,
  };
};

/* ======================================================
   GET RELATED PRODUCTS
====================================================== */

export const getRelatedProducts = async (
  productId: string,
  department: string,
  limit = 4
): Promise<ShopProduct[]> => {
  if (!productId || !department) return [];

  try {
    const relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: productId }, // Exclude the current product
        department: department as any, // Type assertion since department comes from the frontend
        isActive: true,
        isAvailable: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        // Product-level images
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        colors: {
          include: {
            // Color-specific images
            images: {
              orderBy: { sortOrder: 'asc' },
            },
            sizes: {
              where: {
                isActive: true,
                stock: { gt: 0 },
              },
              orderBy: {
                price: 'asc',
              },
            },
          },
        },
      },
    });

    return relatedProducts.map(formatProduct);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};
