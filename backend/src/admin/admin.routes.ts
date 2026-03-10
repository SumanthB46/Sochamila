import { Router } from "express";
import { Role } from "@prisma/client";

import prisma from "../lib/prisma";

import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

// Products
import adminProductRoutes from "./products/admin.product.routes";

// Stickers + Categories
import adminStickerRoutes from "../modules/stickers/sticker.routes";
import adminStickerCategoryRoutes from "../modules/stickers/category.routes";
import adminVendorRoutes from "./admin.vendor.routes";

const router = Router();

/* =========================================================
   🔐 ADMIN AUTH GUARD (GLOBAL)
========================================================= */

router.use(authMiddleware);
// Debug middleware to check what role is being passed
router.use((req, res, next) => {
  console.log("[ADMIN ROUTES] User info:", {
    id: req.user?.id,
    role: req.user?.role,
    email: req.user?.email,
  });
  next();
});
router.use(roleMiddleware([Role.ADMIN]));

/* =========================================================
   📊 ADMIN DASHBOARD STATS (REAL-TIME)
========================================================= */

router.get("/stats", async (req, res) => {
  try {
    console.log("[ADMIN STATS] Fetching stats for admin:", req.user?.id);
    
    const [
      totalProducts,
      totalOrders,
      totalVendors,
      revenueResult,
    ] = await Promise.all([
      // Products count
      prisma.product.count(),

      // Orders except cancelled
      prisma.order.count({
        where: {
          status: {
            not: "CANCELLED",
          },
        },
      }),

      // Vendors
      prisma.user.count({
        where: {
          role: Role.VENDOR,
        },
      }),

      // Paid revenue
      prisma.order.aggregate({
        where: {
          paymentStatus: "PAID",
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ]);

    const stats = {
      products: totalProducts,
      orders: totalOrders,
      vendors: totalVendors,
      revenue: revenueResult._sum.totalAmount || 0,
    };

    console.log("[ADMIN STATS] Stats calculated successfully:", stats);

    res.json({
      success: true,
      data: stats,
      statusCode: 200,
      message: "Dashboard stats retrieved successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[ADMIN STATS] Error:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to load dashboard statistics",
      timestamp: new Date().toISOString(),
    });
  }
});

/* =========================================================
   📦 ADMIN MODULE ROUTES
========================================================= */

// Products
router.use("/products", adminProductRoutes);

// Orders
import adminOrderRoutes from "./admin.order.routes";
router.use("/orders", adminOrderRoutes);

// Stickers
router.use("/stickers", adminStickerRoutes);

// Sticker Categories
router.use("/sticker-categories", adminStickerCategoryRoutes);

// Vendors
router.use("/vendors", adminVendorRoutes);

export default router;
