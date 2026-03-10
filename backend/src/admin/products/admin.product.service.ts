import prisma from "../../lib/prisma";

/* =====================================================
   HELPERS
===================================================== */

// Generate unique SKU with random suffix
const generateSKU = (productName: string, colorName: string, size: string): string => {
  const base = `${productName.replace(/\s+/g, "-").toUpperCase()}-${colorName.replace(/\s+/g, "-").toUpperCase()}-${size.toUpperCase()}`;
  const suffix = Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  return `${base}-${suffix}`;
};

/* =====================================================
   CREATE PRODUCT
===================================================== */

export const createProduct = async (data: any) => {
  if (!data.name || !data.productType || !data.gender || !data.department) {
    throw new Error("Missing required product fields");
  }

  if (!Array.isArray(data.colors) || data.colors.length === 0) {
    throw new Error("Product must have at least one color");
  }

  /* ---------- CALCULATE MIN PRICE & AVAILABILITY ---------- */
  const prices: number[] = [];
  let isAvailable = false;

  for (const color of data.colors) {
    if (!Array.isArray(color.sizes) || color.sizes.length === 0) {
      throw new Error(`Color "${color.name}" has no sizes`);
    }

    for (const size of color.sizes) {
      prices.push(Number(size.price));
      if (Number(size.stock) > 0) isAvailable = true;
    }
  }

  if (!prices.length) {
    throw new Error("No valid prices found");
  }

  const minPrice = Math.min(...prices);

  return prisma.product.create({
    data: {
      name: data.name.trim(),
      description: data.description ?? null,
      gender: data.gender,
      department: data.department,
      productType: data.productType,
      minPrice,
      isActive: data.isActive ?? true,
      isAvailable,
      shippingPolicy: data.shippingPolicy,
      returnPolicy: data.returnPolicy,

      /* PRODUCT IMAGES */
      images: Array.isArray(data.images)
        ? {
            create: data.images.map((img: any, index: number) => ({
              imageUrl: img.imageUrl,
              sortOrder: index,
              isPrimary: index === 0,
              position: img.position || "other",
            })),
          }
        : undefined,

      /* COLORS */
      colors: {
        create: data.colors.map((color: any) => ({
          name: color.name,
          hexCode: color.hexCode ?? null,

          images: Array.isArray(color.images)
            ? {
                create: color.images.map(
                  (img: any, index: number) => ({
                    imageUrl: img.imageUrl,
                    sortOrder: index,
                  })
                ),
              }
            : undefined,

          sizes: {
            create: color.sizes.map((size: any) => ({
              size: size.size,
              sku: generateSKU(data.name, color.name, size.size),
              mrp: Number(size.mrp),
              price: Number(size.price),
              stock: Number(size.stock),
              costPrice:
                size.costPrice !== undefined
                  ? Number(size.costPrice)
                  : null,
            })),
          },
        })),
      },
    },
  });
};

/* =====================================================
   GET ALL PRODUCTS (ADMIN)
===================================================== */

export const getAllProducts = async () => {
  return prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      gender: true,
      department: true,
      productType: true,
      minPrice: true,
      isActive: true,
      isAvailable: true,
      createdAt: true,
      images: {
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          imageUrl: true,
          sortOrder: true,
          isPrimary: true,
          // position: true, // TODO: Enable after running prisma generate
        },
      },
      colors: {
        select: {
          id: true,
          name: true,
          images: {
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              imageUrl: true,
              sortOrder: true,
            },
          },
        },
      },
    },
  });
};

/* =====================================================
   GET PRODUCT BY ID
===================================================== */

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      colors: {
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          sizes: { orderBy: { price: "asc" } },
        },
      },
    },
  });
};

/* =====================================================
   UPDATE PRODUCT (IMAGES + COLORS + PRICES)
===================================================== */

export const updateProduct = async (id: string, data: any) => {
  return prisma.$transaction(async (tx) => {
    /* ---------- BASIC INFO ---------- */
    await tx.product.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        description: data.description ?? null,
        gender: data.gender,
        department: data.department,
        productType: data.productType,
        shippingPolicy: data.shippingPolicy,
        returnPolicy: data.returnPolicy,
      },
    });

    /* ---------- PRODUCT IMAGES ---------- */
    if (Array.isArray(data.images)) {
      await tx.productImage.deleteMany({
        where: { productId: id },
      });

      await tx.productImage.createMany({
        data: data.images.map((img: any, index: number) => ({
          productId: id,
          imageUrl: img.imageUrl,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      });
    }

    /* ---------- COLORS / IMAGES / PRICES ---------- */
    let prices: number[] = [];
    let isAvailable = false;

    if (Array.isArray(data.colors)) {
      // load existing colors for this product
      const existingColors = await tx.productColor.findMany({
        where: { productId: id },
      });

      const incomingNames: string[] = data.colors.map((c: any) => String(c.name || "").trim());

      // process incoming colors (update existing or create new)
      for (let ci = 0; ci < data.colors.length; ci++) {
        const color = data.colors[ci];

        // Prefer matching by id when provided
        let dbColor: any = null;
        if (color.id) {
          dbColor = existingColors.find(ec => ec.id === String(color.id));
        }

        // fallback to name (case-insensitive)
        if (!dbColor) {
          dbColor = existingColors.find(ec => ec.name.toLowerCase() === String(color.name || "").toLowerCase());
        }

        // fallback to positional match
        if (!dbColor) dbColor = existingColors[ci];

        // create if not exists
        if (!dbColor) {
          const created = await tx.productColor.create({
            data: {
              productId: id,
              name: color.name,
              hexCode: color.hexCode ?? null,
            },
          });
          dbColor = created;
        } else {
          // update name/hex if changed
          await tx.productColor.update({
            where: { id: dbColor.id },
            data: {
              name: color.name,
              hexCode: color.hexCode ?? dbColor.hexCode,
            },
          });
        }

        /* COLOR IMAGES */
        if (Array.isArray(color.images)) {
          await tx.productColorImage.deleteMany({
            where: { colorId: dbColor.id },
          });

          if (color.images.length > 0) {
            await tx.productColorImage.createMany({
              data: color.images.map((img: any, index: number) => ({
                colorId: dbColor.id,
                imageUrl: img.imageUrl,
                sortOrder: index,
              })),
            });
          }
        }

        /* SIZES */
        if (Array.isArray(color.sizes)) {
          for (const size of color.sizes) {
            const updateRes = await tx.productSize.updateMany({
              where: {
                colorId: dbColor.id,
                size: size.size,
              },
              data: {
                mrp: Number(size.mrp),
                price: Number(size.price),
                stock: Number(size.stock),
              },
            });

            // if no existing size updated, create it
            if (updateRes.count === 0) {
              await tx.productSize.create({
                data: {
                  colorId: dbColor.id,
                  size: size.size,
                  sku: generateSKU(data.name, String(color.name), String(size.size)),
                  mrp: Number(size.mrp),
                  price: Number(size.price),
                  stock: Number(size.stock),
                  costPrice: size.costPrice !== undefined ? Number(size.costPrice) : null,
                },
              });
            }

            prices.push(Number(size.price));
            if (Number(size.stock) > 0) isAvailable = true;
          }
        }
      }

      // remove any DB colors that are not present in incoming payload
      // If incoming payload includes ids, use them for deletion check; otherwise fall back to name matching
      const incomingIds = data.colors.map((c: any) => (c.id ? String(c.id) : null)).filter(Boolean) as string[];
      if (incomingIds.length > 0) {
        for (const existing of existingColors) {
          if (!incomingIds.includes(existing.id)) {
            await tx.productColor.delete({ where: { id: existing.id } });
          }
        }
      } else {
        for (const existing of existingColors) {
          if (!incomingNames.some(n => n.toLowerCase() === existing.name.toLowerCase())) {
            await tx.productColor.delete({ where: { id: existing.id } });
          }
        }
      }
    }

    /* ---------- UPDATE MIN PRICE & AVAILABILITY ---------- */
    if (prices.length > 0) {
      await tx.product.update({
        where: { id },
        data: {
          minPrice: Math.min(...prices),
          isAvailable,
        },
      });
    }

    /* ---------- RETURN UPDATED PRODUCT ---------- */
    return tx.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        colors: {
          include: {
            images: { orderBy: { sortOrder: "asc" } },
            sizes: { orderBy: { price: "asc" } },
          },
        },
      },
    });
  });
};

/* =====================================================
   UPDATE ACTIVE STATUS
===================================================== */

export const updateProductStatus = async (
  id: string,
  isActive: boolean
) => {
  return prisma.product.update({
    where: { id },
    data: {
      isActive,
      isAvailable: isActive,
    },
  });
};

/* =====================================================
   DELETE PRODUCT
===================================================== */

export const deleteProduct = async (id: string) => {
  // Prevent deleting products that have been ordered (order items reference sizes)
  // Find sizes belonging to this product
  const sizes = await prisma.productSize.findMany({
    where: {
      color: { productId: id },
    },
    select: { id: true },
  });

  if (sizes.length > 0) {
    const sizeIds = sizes.map((s) => s.id);
    const linkedOrders = await prisma.orderItem.count({
      where: { sizeId: { in: sizeIds } },
    });

    if (linkedOrders > 0) {
      throw new Error("Product has associated orders and cannot be deleted");
    }
  }

  return prisma.product.delete({ where: { id } });
};
