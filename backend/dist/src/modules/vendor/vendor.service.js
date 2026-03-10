"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorDashboardService = getVendorDashboardService;
exports.getVendorOrdersService = getVendorOrdersService;
exports.getVendorStatsService = getVendorStatsService;
exports.updateOrderStatusService = updateOrderStatusService;
const prisma_1 = require("../../config/prisma");
/**
 * Get vendor dashboard data
 */
async function getVendorDashboardService(vendorId) {
    try {
        console.log("[VENDOR-SERVICE] Getting dashboard for vendor:", vendorId);
        // Get vendor profile
        const vendor = await prisma_1.prisma.user.findUnique({
            where: { id: vendorId },
            select: {
                id: true,
                name: true,
                email: true,
            },
        });
        console.log("[VENDOR-SERVICE] Vendor profile fetched:", vendor);
        // Get vendor's orders
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        vendorId: vendorId,
                    },
                },
            },
            include: {
                items: {
                    where: {
                        vendorId: vendorId,
                    },
                },
            },
        });
        console.log("[VENDOR-SERVICE] Found orders:", orders.length);
        // Calculate metrics
        const assignedOrders = orders.length;
        const pendingDispatch = orders.filter((o) => o.status === "PRINTING" || o.status === "CONFIRMED").length;
        const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
        // Calculate earnings from vendor's items
        let totalEarnings = 0;
        try {
            totalEarnings = orders.reduce((sum, order) => {
                const vendorItems = order.items.filter((item) => item.vendorId === vendorId);
                const itemTotal = vendorItems.reduce((itemSum, item) => {
                    const price = item.price ? Number(item.price) : 0;
                    return itemSum + price;
                }, 0);
                return sum + itemTotal;
            }, 0);
        }
        catch (err) {
            console.warn("[VENDOR-SERVICE] Error calculating earnings:", err);
            totalEarnings = 0;
        }
        console.log("[VENDOR-SERVICE] Total earnings calculated:", totalEarnings);
        // Get recent orders (last 3)
        const recentOrders = orders.slice(-3).reverse();
        // Calculate average order value
        let avgOrderValue = 0;
        try {
            avgOrderValue =
                orders.length > 0
                    ? orders.reduce((sum, order) => sum + Number(order.totalAmount), 0) /
                        orders.length
                    : 0;
        }
        catch (err) {
            console.warn("[VENDOR-SERVICE] Error calculating average:", err);
            avgOrderValue = 0;
        }
        let commissionRate = 15;
        try {
            const commissionConfig = await prisma_1.prisma.commissionConfig.findFirst({
                where: {
                    vendorId: vendorId,
                },
            });
            if (commissionConfig) {
                commissionRate = Number(commissionConfig.commissionPercentage);
            }
        }
        catch (err) {
            console.warn("[VENDOR-SERVICE] Failed to fetch commission config, using default 15%:", err);
        }
        // Calculate store rating from reviews
        let storeRating = 0;
        try {
            const reviews = await prisma_1.prisma.review.findMany({
                where: {
                    orderItem: {
                        vendorId: vendorId,
                    },
                    isApproved: true,
                },
                select: {
                    rating: true,
                },
            });
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                storeRating = Math.round((totalRating / reviews.length) * 10) / 10;
            }
        }
        catch (err) {
            console.warn("[VENDOR-SERVICE] Error calculating store rating:", err);
            storeRating = 0;
        }
        const pendingPayout = (totalEarnings * commissionRate) / 100;
        const result = {
            metrics: {
                assignedOrders,
                pendingDispatch,
                completedOrders,
                totalEarnings: Math.round(totalEarnings * 100) / 100,
            },
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                orderId: order.id.slice(0, 8).toUpperCase(),
                status: order.status,
                date: order.createdAt.toISOString(),
                totalAmount: Math.round(Number(order.totalAmount) * 100) / 100,
            })),
            quickStats: {
                avgOrderValue: Math.round(avgOrderValue * 100) / 100,
                commissionRate,
                pendingPayout: Math.round(pendingPayout * 100) / 100,
                storeRating: storeRating || 0,
            },
            vendor: vendor ? {
                id: vendor.id,
                name: vendor.name,
                email: vendor.email,
                businessName: vendor.name,
            } : null,
        };
        console.log("[VENDOR-SERVICE] Dashboard data prepared successfully:", result);
        return result;
    }
    catch (err) {
        console.error("[VENDOR-SERVICE] Error in getVendorDashboardService:", err);
        throw err;
    }
}
/**
 * Get vendor's assigned orders
 */
async function getVendorOrdersService(vendorId) {
    try {
        console.log("[VENDOR-SERVICE] Getting orders for vendor:", vendorId);
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        vendorId: vendorId,
                    },
                },
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                items: {
                    where: {
                        vendorId: vendorId,
                    },
                    include: {
                        size: {
                            include: {
                                color: {
                                    include: {
                                        product: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        console.log("[VENDOR-SERVICE] Found", orders.length, "orders");
        const result = orders.map((order) => ({
            orderId: order.id.slice(0, 8).toUpperCase(),
            customer: order.user?.name || "N/A",
            email: order.user?.email || "N/A",
            items: order.items.length,
            total: Math.round(Number(order.totalAmount) * 100) / 100,
            status: order.status,
            date: order.createdAt.toISOString(),
            itemDetails: order.items.map((item) => ({
                id: item.id,
                product: item.size?.color?.product?.name || "Unknown Product",
                quantity: item.quantity,
                price: item.price ? Math.round(Number(item.price) * 100) / 100 : 0,
                imageUrl: item.imageUrl,
            })),
        }));
        console.log("[VENDOR-SERVICE] Orders prepared successfully");
        return result;
    }
    catch (err) {
        console.error("[VENDOR-SERVICE] Error in getVendorOrdersService:", err);
        throw err;
    }
}
/**
 * Get vendor statistics
 */
async function getVendorStatsService(vendorId) {
    try {
        console.log("[VENDOR-SERVICE] Getting stats for vendor:", vendorId);
        // Get all orders from past 3 months
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const orders = await prisma_1.prisma.order.findMany({
            where: {
                items: {
                    some: {
                        vendorId: vendorId,
                    },
                },
                createdAt: {
                    gte: threeMonthsAgo,
                },
            },
            include: {
                items: {
                    where: {
                        vendorId: vendorId,
                    },
                },
            },
        });
        console.log("[VENDOR-SERVICE] Found", orders.length, "orders in past 3 months");
        // Group by month
        const monthlyData = new Map();
        orders.forEach((order) => {
            const month = order.createdAt.toLocaleString("default", {
                year: "numeric",
                month: "long",
            });
            if (!monthlyData.has(month)) {
                monthlyData.set(month, {
                    orders: 0,
                    revenue: 0,
                });
            }
            const data = monthlyData.get(month);
            data.orders += 1;
            data.revenue += Number(order.totalAmount);
        });
        const earnings = Array.from(monthlyData.entries()).map(([month, data]) => ({
            month,
            orders: data.orders,
            revenue: Math.round(data.revenue * 100) / 100,
            commission: Math.round((data.revenue * 15) / 100 * 100) / 100,
        }));
        // Calculate totals
        const totalSales = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const conversionRate = orders.length > 0 ? (orders.length / (orders.length + 10)) * 100 : 0;
        const avgOrderValue = orders.length > 0 ? totalSales / orders.length : 0;
        const result = {
            totalSales: Math.round(totalSales * 100) / 100,
            conversionRate: Math.round(conversionRate * 100) / 100,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            earnings,
            topProducts: [
                { product: "T-Shirt", sales: 45, revenue: 1350 },
                { product: "Hoodie", sales: 28, revenue: 1120 },
                { product: "Cap", sales: 15, revenue: 225 },
            ],
        };
        console.log("[VENDOR-SERVICE] Stats prepared successfully");
        return result;
    }
    catch (err) {
        console.error("[VENDOR-SERVICE] Error in getVendorStatsService:", err);
        throw err;
    }
}
/**
 * Update vendor order status
 */
async function updateOrderStatusService(vendorId, orderId, newStatus) {
    try {
        console.log("[VENDOR-SERVICE] Updating order status:", {
            vendorId,
            orderId,
            newStatus,
        });
        // Verify the vendor has an item in this order
        const orderItem = await prisma_1.prisma.orderItem.findFirst({
            where: {
                order: {
                    id: orderId,
                },
                vendorId: vendorId,
            },
            include: {
                order: true,
            },
        });
        if (!orderItem) {
            throw new Error("Order not found or vendor does not have items in this order");
        }
        // Update the order status
        const updatedOrder = await prisma_1.prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: newStatus,
            },
            include: {
                items: {
                    where: {
                        vendorId: vendorId,
                    },
                },
            },
        });
        console.log("[VENDOR-SERVICE] Order status updated successfully:", updatedOrder.id);
        return {
            id: updatedOrder.id,
            orderId: updatedOrder.id.slice(0, 8).toUpperCase(),
            status: updatedOrder.status,
            date: updatedOrder.createdAt.toISOString(),
            totalAmount: Math.round(Number(updatedOrder.totalAmount) * 100) / 100,
        };
    }
    catch (err) {
        console.error("[VENDOR-SERVICE] Error updating order status:", err);
        throw err;
    }
}
