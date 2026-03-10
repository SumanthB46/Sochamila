"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = placeOrder;
exports.getOrders = getOrders;
const prisma_1 = __importDefault(require("../../lib/prisma"));
async function placeOrder(req, res) {
    try {
        const { userId, totalAmount, items } = req.body;
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // items: [{ sizeId, quantity, price, mockupUrl?, imageUrl?, pdfUrl? }]
        const order = await prisma_1.default.order.create({
            data: {
                userId,
                totalAmount: totalAmount || items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0),
                items: {
                    create: items.map((it) => ({
                        sizeId: it.sizeId,
                        quantity: it.quantity || 1,
                        price: it.price || 0,
                        // store design/mockup/image/PDF links on order item if provided
                        ...(it.mockupUrl ? { mockupUrl: it.mockupUrl } : {}),
                        ...(it.imageUrl ? { imageUrl: it.imageUrl } : {}),
                        ...(it.pdfUrl ? { pdfUrl: it.pdfUrl } : {}),
                    })),
                },
            },
            include: { items: true },
        });
        // Notify admin (placeholder) — could be email, webhook, or notification system
        console.log("[ADMIN NOTIFY] New order placed:", {
            orderId: order.id,
            userId: order.userId,
            totalAmount: order.totalAmount,
            items: order.items.map((item) => ({
                id: item.id,
                sizeId: item.sizeId,
                quantity: item.quantity,
                price: item.price,
                imageUrl: item.imageUrl,
                mockupUrl: item.mockupUrl,
                pdfUrl: item.pdfUrl,
            })),
        });
        return res.json({ success: true, order });
    }
    catch (error) {
        console.error("PLACE ORDER ERROR:", error);
        return res.status(500).json({ error: "Failed to place order" });
    }
}
async function getOrders(_req, res) {
    try {
        const orders = await prisma_1.default.order.findMany({
            include: { items: { include: { size: true, vendor: true } }, user: true },
            orderBy: { createdAt: "desc" },
        });
        return res.json({ success: true, orders });
    }
    catch (error) {
        console.error("GET ORDERS ERROR:", error);
        return res.status(500).json({ error: "Failed to fetch orders" });
    }
}
