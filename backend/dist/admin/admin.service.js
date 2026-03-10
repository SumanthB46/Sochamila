"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminStatsService = getAdminStatsService;
const prisma_1 = require("../lib/prisma");
async function getAdminStatsService() {
    const [products, vendors] = await Promise.all([
        prisma_1.prisma.product.count(),
        prisma_1.prisma.user.count({
            where: { role: "VENDOR" },
        }),
    ]);
    // Orders not implemented yet → safe defaults
    const orders = 0;
    const revenue = 0;
    return {
        products,
        orders,
        vendors,
        revenue,
    };
}
