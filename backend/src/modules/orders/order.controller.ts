import { Request, Response } from "express";
import prisma from "../../lib/prisma";

export async function placeOrder(req: Request, res: Response) {
  try {
    const { userId, totalAmount, items } = req.body;

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // items: [{ sizeId, quantity, price, mockupUrl?, imageUrl?, pdfUrl?, frontName?, stickerUrls?, graphicUrls?, aiGeneratedImages?, mockupImages? }]
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount: totalAmount || items.reduce((s: number, it: any) => s + (it.price || 0) * (it.quantity || 1), 0),
        items: {
          create: items.map((it: any) => ({
            sizeId: it.sizeId,
            quantity: it.quantity || 1,
            price: it.price || 0,
            // store design/mockup/image/PDF links on order item if provided
            ...(it.mockupUrl ? { mockupUrl: it.mockupUrl } : {}),
            ...(it.imageUrl ? { imageUrl: it.imageUrl } : {}),
            ...(it.pdfUrl ? { pdfUrl: it.pdfUrl } : {}),
            ...(it.frontName ? { frontName: it.frontName } : {}),
            ...(it.stickerUrls ? { stickerUrls: it.stickerUrls } : {}),
            ...(it.graphicUrls ? { graphicUrls: it.graphicUrls } : {}),
            ...(it.aiGeneratedImages ? { aiGeneratedImages: it.aiGeneratedImages } : {}),
            ...(it.mockupImages ? { mockupImages: it.mockupImages } : {}),
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
      items: order.items.map((item: any) => ({
        id: item.id,
        sizeId: item.sizeId,
        quantity: item.quantity,
        price: item.price,
        imageUrl: item.imageUrl,
        mockupUrl: item.mockupUrl,
        pdfUrl: item.pdfUrl,
        frontName: item.frontName,
        stickerUrls: item.stickerUrls,
        graphicUrls: item.graphicUrls,
        aiGeneratedImages: item.aiGeneratedImages,
        mockupImages: item.mockupImages,
      })),
    });

    return res.json({ success: true, order });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    return res.status(500).json({ error: "Failed to place order" });
  }
}

export async function getOrders(_req: Request, res: Response) {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { size: true, vendor: true } }, user: true },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ success: true, orders });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
}
