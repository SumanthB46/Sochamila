import { Request, Response } from "express";
import { getAdminStatsService } from "./admin.service";
import prisma from "../lib/prisma";

export const getAdminStats = async (
  _req: Request,
  res: Response
) => {
  try {
    const stats = await getAdminStatsService();
    return res.json(stats);
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    return res.status(500).json({
      message: "Failed to load admin stats",
    });
  }
};

/**
 * GET /admin/orders/:orderId/designs
 * Retrieve all design files (image, mockup, PDF) for an order
 * Admin can view customer designs and assign them to vendors
 */
export const getOrderDesigns = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    const order = await prisma.order.findUnique({
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
    }) as any;

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Map items with design information
    const itemsWithDesigns = order.items.map((item: any) => ({
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
        frontName: item.frontName,
        stickerUrls: item.stickerUrls,
        graphicUrls: item.graphicUrls,
        aiGeneratedImages: item.aiGeneratedImages,
        mockupImages: item.mockupImages,
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
      hasDesigns: itemsWithDesigns.some(
        (item: any) =>
          item.design.imageUrl ||
          item.design.mockupUrl ||
          item.design.pdfUrl ||
          item.design.frontName ||
          (item.design.stickerUrls && item.design.stickerUrls.length > 0) ||
          (item.design.graphicUrls && item.design.graphicUrls.length > 0) ||
          (item.design.aiGeneratedImages && item.design.aiGeneratedImages.length > 0)
      ),
    });
  } catch (error) {
    console.error("GET ORDER DESIGNS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch order designs" });
  }
};
