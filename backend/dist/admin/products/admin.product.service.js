"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProductStatus = exports.updateProduct = exports.getProductById = exports.getAllProducts = exports.createProduct = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));

/* =====================================================
   HELPERS
===================================================== */

// Generate unique SKU with random suffix
const generateSKU = (productName, colorName, size) => {
    const base = `${productName.replace(/\s+/g, "-").toUpperCase()}-${colorName.replace(/\s+/g, "-").toUpperCase()}-${size.toUpperCase()}`;
    const suffix = Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
    return `${base}-${suffix}`;
};

/* =====================================================
   CREATE PRODUCT
===================================================== */
const createProduct = async (data) => {
    if (!data.name || !data.productType || !data.audience) {
        throw new Error("Missing required product fields");
    }
    if (!Array.isArray(data.colors) || data.colors.length === 0) {
        throw new Error("Product must have at least one color");
    }
    /* ---------- CALCULATE MIN PRICE & AVAILABILITY ---------- */
    const prices = [];
    let isAvailable = false;
    for (const color of data.colors) {
        if (!Array.isArray(color.sizes) || color.sizes.length === 0) {
            throw new Error(`Color "${color.name}" has no sizes`);
        }
        for (const size of color.sizes) {
            prices.push(Number(size.price));
            if (Number(size.stock) > 0)
                isAvailable = true;
        }
    }
    if (!prices.length) {
        throw new Error("No valid prices found");
    }
    const minPrice = Math.min(...prices);
    return prisma_1.default.product.create({
        data: {
            name: data.name.trim(),
            description: data.description ?? null,
            audience: data.audience,
            productType: data.productType,
            minPrice,
            isActive: data.isActive ?? true,
            isAvailable,
            /* PRODUCT IMAGES */
            images: Array.isArray(data.images)
                ? {
                    create: data.images.map((img, index) => ({
                        imageUrl: img.imageUrl,
                        sortOrder: index,
                        isPrimary: index === 0,
                    })),
                }
                : undefined,
            /* COLORS */
            colors: {
                create: data.colors.map((color) => ({
                    name: color.name,
                    hexCode: color.hexCode ?? null,
                    images: Array.isArray(color.images)
                        ? {
                            create: color.images.map((img, index) => ({
                                imageUrl: img.imageUrl,
                                sortOrder: index,
                            })),
                        }
                        : undefined,
                    sizes: {
                        create: color.sizes.map((size) => ({
                            size: size.size,
                            sku: generateSKU(data.name, color.name, size.size),
                            mrp: Number(size.mrp),
                            price: Number(size.price),
                            stock: Number(size.stock),
                            costPrice: size.costPrice !== undefined
                                ? Number(size.costPrice)
                                : null,
                        })),
                    },
                })),
            },
        },
    });
};
exports.createProduct = createProduct;
/* =====================================================
   GET ALL PRODUCTS (ADMIN)
===================================================== */
const getAllProducts = async () => {
    return prisma_1.default.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            audience: true,
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
                },
            },
        },
    });
};
exports.getAllProducts = getAllProducts;
/* =====================================================
   GET PRODUCT BY ID
===================================================== */
const getProductById = async (id) => {
    return prisma_1.default.product.findUnique({
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
exports.getProductById = getProductById;
/* =====================================================
   UPDATE PRODUCT (IMAGES + COLORS + PRICES)
===================================================== */
const updateProduct = async (id, data) => {
    return prisma_1.default.$transaction(async (tx) => {
        /* ---------- BASIC INFO ---------- */
        await tx.product.update({
            where: { id },
            data: {
                name: data.name?.trim(),
                description: data.description ?? null,
            },
        });
        /* ---------- PRODUCT IMAGES ---------- */
        if (Array.isArray(data.images)) {
            await tx.productImage.deleteMany({
                where: { productId: id },
            });
            await tx.productImage.createMany({
                data: data.images.map((img, index) => ({
                    productId: id,
                    imageUrl: img.imageUrl,
                    sortOrder: index,
                    isPrimary: index === 0,
                })),
            });
        }
        /* ---------- COLORS / IMAGES / PRICES ---------- */
        let prices = [];
        let isAvailable = false;
        if (Array.isArray(data.colors)) {
            // load existing colors for this product
            const existingColors = await tx.productColor.findMany({
                where: { productId: id },
            });
            const incomingNames = data.colors.map((c) => String(c.name || "").trim());
            // process incoming colors (update existing or create new)
            for (let ci = 0; ci < data.colors.length; ci++) {
                const color = data.colors[ci];
                // Prefer matching by id when provided
                let dbColor = null;
                if (color.id) {
                    dbColor = existingColors.find(ec => ec.id === String(color.id));
                }
                // fallback to name (case-insensitive)
                if (!dbColor) {
                    dbColor = existingColors.find(ec => ec.name.toLowerCase() === String(color.name || "").toLowerCase());
                }
                // fallback to positional match
                if (!dbColor)
                    dbColor = existingColors[ci];
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
                }
                else {
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
                            data: color.images.map((img, index) => ({
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
                        if (Number(size.stock) > 0)
                            isAvailable = true;
                    }
                }
            }
            // remove any DB colors that are not present in incoming payload
            // If incoming payload includes ids, use them for deletion check; otherwise fall back to name matching
            const incomingIds = data.colors.map((c) => (c.id ? String(c.id) : null)).filter(Boolean);
            if (incomingIds.length > 0) {
                for (const existing of existingColors) {
                    if (!incomingIds.includes(existing.id)) {
                        await tx.productColor.delete({ where: { id: existing.id } });
                    }
                }
            }
            else {
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
exports.updateProduct = updateProduct;
/* =====================================================
   UPDATE ACTIVE STATUS
===================================================== */
const updateProductStatus = async (id, isActive) => {
    return prisma_1.default.product.update({
        where: { id },
        data: {
            isActive,
            isAvailable: isActive,
        },
    });
};
exports.updateProductStatus = updateProductStatus;
/* =====================================================
   DELETE PRODUCT
===================================================== */
const deleteProduct = async (id) => {
    return prisma_1.default.product.delete({
        where: { id },
    });
};
exports.deleteProduct = deleteProduct;
