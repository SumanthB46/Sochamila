"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicProductById = exports.getAllPublicProducts = void 0;
const prisma_1 = require("../../config/prisma");
const VIEW_BY_ORDER = ["FRONT", "BACK", "LEFT", "RIGHT"];
/* ======================================================
   FORMAT PRODUCT FOR SHOP FRONTEND
====================================================== */
const formatProduct = (product) => {
    // Product-level images with view by order (for fallback)
    const productImages = (product.images ?? [])
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img, index) => ({
            image: img.imageUrl,
            view: VIEW_BY_ORDER[index] ?? VIEW_BY_ORDER[0],
        }));
    const variants = product.colors?.flatMap((color) => color.sizes?.map((size) => {
        // Color images: assign view by sortOrder (0=FRONT, 1=BACK, 2=LEFT, 3=RIGHT)
        const colorImages = (color.images ?? [])
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((img, index) => ({
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
    }) ?? []) ?? [];
    const minPrice = variants.length > 0
        ? Math.min(...variants.map(v => v.price))
        : 0;
    // Use first product image as thumbnail
    const thumbnail = product.images?.[0]?.imageUrl ?? null;
    return {
        id: product.id,
        name: product.name,
        description: product.description ?? null,
        audience: product.audience,
        productType: product.productType,
        thumbnail,
        minPrice,
        variants,
    };
};
/* ======================================================
   GET ALL PUBLIC PRODUCTS (SHOP PAGE)
====================================================== */
const getAllPublicProducts = async () => {
    const products = await prisma_1.prisma.product.findMany({
        where: {
            isActive: true,
            isAvailable: true,
        },
        orderBy: {
            createdAt: "desc",
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
    return products.map(formatProduct);
};
exports.getAllPublicProducts = getAllPublicProducts;
/* ======================================================
   GET SINGLE PRODUCT (DETAIL PAGE)
====================================================== */
const getPublicProductById = async (id) => {
    if (!id)
        return null;
    const product = await prisma_1.prisma.product.findFirst({
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
exports.getPublicProductById = getPublicProductById;
