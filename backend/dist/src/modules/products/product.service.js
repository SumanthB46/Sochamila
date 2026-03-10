"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRelatedProducts = exports.getSizeById = exports.getPublicProductById = exports.getAllPublicProducts = void 0;
const prisma_1 = require("../../config/prisma");
/* ======================================================
   TYPES
====================================================== */
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
const getAllPublicProducts = async (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
        prisma_1.prisma.product.findMany({
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
        prisma_1.prisma.product.count({
            where: {
                isActive: true,
                isAvailable: true,
            },
        }),
    ]);
    return { items: products.map(formatProduct), total };
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
/* ======================================================
   GET SIZE BY ID (for checkout page)
====================================================== */
const getSizeById = async (sizeId) => {
    if (!sizeId)
        return null;
    const size = await prisma_1.prisma.productSize.findUnique({
        where: { id: sizeId },
        select: {
            id: true,
            size: true,
            price: true,
            sku: true,
        },
    });
    if (!size)
        return null;
    return {
        id: size.id,
        sizeId: size.id, // Include both for compatibility
        size: size.size,
        price: size.price,
    };
};
exports.getSizeById = getSizeById;
/* ======================================================
   GET RELATED PRODUCTS
====================================================== */
const getRelatedProducts = async (productId, department, limit = 4) => {
    if (!productId || !department)
        return [];
    try {
        const relatedProducts = await prisma_1.prisma.product.findMany({
            where: {
                id: { not: productId }, // Exclude the current product
                department: department, // Type assertion since department comes from the frontend
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
    }
    catch (error) {
        console.error('Error fetching related products:', error);
        return [];
    }
};
exports.getRelatedProducts = getRelatedProducts;
