"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVendorDashboard = getVendorDashboard;
exports.getVendorOrders = getVendorOrders;
exports.getVendorStats = getVendorStats;
exports.updateOrderStatus = updateOrderStatus;
exports.getVendorAssignedDesigns = getVendorAssignedDesigns;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const vendor_service_1 = require("./vendor.service");
/**
 * Get vendor dashboard data
 */
async function getVendorDashboard(req, res) {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            console.warn("[VENDOR-CONTROLLER] No vendor ID in request, user:", req.user);
            return res.status(401).json({
                success: false,
                message: "Unauthorized - no vendor ID",
            });
        }
        console.log("[VENDOR-CONTROLLER] Dashboard request for vendorId:", vendorId);
        console.log("[VENDOR-CONTROLLER] req.user:", req.user);
        const data = await (0, vendor_service_1.getVendorDashboardService)(vendorId);
        console.log("[VENDOR-CONTROLLER] Dashboard service returned successfully");
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("[VENDOR-CONTROLLER] Error fetching dashboard:", error);
        console.error("[VENDOR-CONTROLLER] Error stack:", error.stack);
        console.error("[VENDOR-CONTROLLER] Error details:", {
            name: error.name,
            message: error.message,
            code: error.code,
        });
        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor dashboard",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
/**
 * Get vendor's assigned orders
 */
async function getVendorOrders(req, res) {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            console.warn("[VENDOR] No vendor ID in request");
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        console.log("[VENDOR] Fetching orders for vendor:", vendorId);
        const data = await (0, vendor_service_1.getVendorOrdersService)(vendorId);
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("[VENDOR] Error fetching orders:", error);
        console.error("[VENDOR] Error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor orders",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
/**
 * Get vendor statistics
 */
async function getVendorStats(req, res) {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            console.warn("[VENDOR] No vendor ID in request");
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        console.log("[VENDOR] Fetching stats for vendor:", vendorId);
        const data = await (0, vendor_service_1.getVendorStatsService)(vendorId);
        res.json({
            success: true,
            data,
        });
    }
    catch (error) {
        console.error("[VENDOR] Error fetching stats:", error);
        console.error("[VENDOR] Error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor stats",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
/**
 * Update order status
 */
async function updateOrderStatus(req, res) {
    try {
        const vendorId = req.user?.id;
        const orderId = typeof req.params.orderId === "string" ? req.params.orderId : "";
        const { status } = req.body;
        if (!vendorId) {
            console.warn("[VENDOR-CONTROLLER] No vendor ID in request");
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
        }
        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required",
            });
        }
        console.log("[VENDOR-CONTROLLER] Updating order status:", {
            orderId,
            vendorId,
            newStatus: status,
        });
        const data = await (0, vendor_service_1.updateOrderStatusService)(vendorId, orderId, status);
        res.json({
            success: true,
            data,
            message: "Order status updated successfully",
        });
    }
    catch (error) {
        console.error("[VENDOR-CONTROLLER] Error updating order status:", error);
        console.error("[VENDOR-CONTROLLER] Error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
        res.status(500).json({
            success: false,
            message: error.message || "Failed to update order status",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
/**
 * Get vendor's assigned designs
 * Returns all order items assigned to this vendor with their design files
 */
async function getVendorAssignedDesigns(req, res) {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            console.warn("[VENDOR-CONTROLLER] No vendor ID in request");
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        console.log("[VENDOR-CONTROLLER] Fetching assigned designs for vendor:", vendorId);
        // Get all order items assigned to this vendor
        const assignedItems = await prisma_1.default.orderItem.findMany({
            where: { vendorId },
            include: {
                order: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
                size: {
                    include: {
                        color: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { order: { createdAt: "desc" } },
        });
        // Group by order and format with designs
        const designs = assignedItems.map((item) => ({
            orderItemId: item.id,
            orderId: item.orderId,
            order: {
                id: item.order.id,
                customerId: item.order.userId,
                customer: item.order.user,
                totalAmount: item.order.totalAmount,
                status: item.order.status,
                createdAt: item.order.createdAt,
            },
            product: item.size.color.product,
            size: {
                id: item.size.id,
                label: item.size.size,
            },
            quantity: item.quantity,
            price: item.price,
            fulfillmentStatus: item.fulfillmentStatus,
            design: {
                imageUrl: item.imageUrl,
                mockupUrl: item.mockupUrl,
                pdfUrl: item.pdfUrl,
            },
            hasDesigns: Boolean(item.imageUrl) ||
                Boolean(item.mockupUrl) ||
                Boolean(item.pdfUrl),
        }));
        res.json({
            success: true,
            data: designs,
            totalAssignedDesigns: designs.length,
            designsWithFiles: designs.filter((d) => d.hasDesigns).length,
        });
    }
    catch (error) {
        console.error("[VENDOR-CONTROLLER] Error fetching assigned designs:", error);
        console.error("[VENDOR-CONTROLLER] Error details:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
        });
        res.status(500).json({
            success: false,
            message: "Failed to fetch assigned designs",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}
