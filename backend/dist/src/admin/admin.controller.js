"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDesigns = exports.getAdminStats = void 0;
const admin_service_1 = require("./admin.service");
const prisma_1 = __importDefault(require("../lib/prisma"));
const getAdminStats = async (_req, res) => {
    try {
        const stats = await (0, admin_service_1.getAdminStatsService)();
        return res.json(stats);
    }
    catch (error) {
        console.error("ADMIN STATS ERROR:", error);
        return res.status(500).json({
            message: "Failed to load admin stats",
        });
    }
};
exports.getAdminStats = getAdminStats;
/**
 * GET /admin/orders/:orderId/designs
 * Retrieve all design files (image, mockup, PDF) for an order
 * Admin can view customer designs and assign them to vendors
 */
const getOrderDesigns = async (req, res) => {
    try {
        const { orderId } = req.params;
        if (!orderId) {
            return res.status(400).json({ error: "Order ID is required" });
        }
        const order = await prisma_1.default.order.findUnique({
            where: { id: typeof orderId === 'string' ? orderId : '' },
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: {
                    include: {
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
                        vendor: {
                            select: { id: true, name: true, email: true },
                        },
                    },
                },
            },
        });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }
        // Map items with design information
        const itemsWithDesigns = order.items.map((item) => ({
            id: item.id,
            sizeId: item.sizeId,
            quantity: item.quantity,
            price: item.price,
            fulfillmentStatus: item.fulfillmentStatus,
            vendor: item.vendor,
            design: {
                imageUrl: item.imageUrl,
                mockupUrl: item.mockupUrl,
                pdfUrl: item.pdfUrl,
            },
            product: item.size.color.product,
            size: {
                id: item.size.id,
                label: item.size.size,
            },
        }));
        return res.json({
            success: true,
            order: {
                id: order.id,
                customerId: order.userId,
                customer: order.user,
                totalAmount: order.totalAmount,
                createdAt: order.createdAt,
            },
            items: itemsWithDesigns,
            hasDesigns: itemsWithDesigns.some((item) => item.design.imageUrl ||
                item.design.mockupUrl ||
                item.design.pdfUrl),
        });
    }
    catch (error) {
        console.error("GET ORDER DESIGNS ERROR:", error);
        return res.status(500).json({ error: "Failed to fetch order designs" });
    }
};
exports.getOrderDesigns = getOrderDesigns;
