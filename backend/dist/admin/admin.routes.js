"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
// Products
const admin_product_routes_1 = __importDefault(require("./products/admin.product.routes"));
// Stickers + Categories
const sticker_routes_1 = __importDefault(require("../modules/stickers/sticker.routes"));
const category_routes_1 = __importDefault(require("../modules/stickers/category.routes"));
const router = (0, express_1.Router)();
/* =========================================================
   🔐 ADMIN AUTH GUARD (GLOBAL)
========================================================= */
router.use(auth_middleware_1.authMiddleware);
router.use((0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]));
/* =========================================================
   📊 ADMIN DASHBOARD STATS (REAL-TIME)
========================================================= */
router.get("/stats", async (req, res) => {
    try {
        const [totalProducts, totalOrders, totalVendors, revenueResult,] = await Promise.all([
            // Products count
            prisma_1.default.product.count(),
            // Orders except cancelled
            prisma_1.default.order.count({
                where: {
                    status: {
                        not: "CANCELLED",
                    },
                },
            }),
            // Vendors
            prisma_1.default.user.count({
                where: {
                    role: client_1.Role.VENDOR,
                },
            }),
            // Paid revenue
            prisma_1.default.order.aggregate({
                where: {
                    paymentStatus: "PAID",
                },
                _sum: {
                    totalAmount: true,
                },
            }),
        ]);
        res.json({
            products: totalProducts,
            orders: totalOrders,
            vendors: totalVendors,
            revenue: revenueResult._sum.totalAmount || 0,
        });
    }
    catch (error) {
        console.error("Admin dashboard stats error:", error);
        res.status(500).json({
            message: "Failed to load dashboard statistics",
        });
    }
});
/* =========================================================
   📦 ADMIN MODULE ROUTES
========================================================= */
// Products
router.use("/products", admin_product_routes_1.default);
// Stickers
router.use("/stickers", sticker_routes_1.default);
// Sticker Categories
router.use("/sticker-categories", category_routes_1.default);
exports.default = router;
