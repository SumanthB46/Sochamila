import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

/**
 * GET /api/admin/orders
 * Returns orders with items for admin dashboard (default: PLACED)
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;

    const whereClause = status
      ? { status: status as any }
      : undefined;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        items: {
          include: {
            size: true,
            vendor: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("ADMIN ORDERS LIST ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

/**
 * POST /api/admin/orders/assign/:orderItemId
 * Body: { vendorId: string }
 * Assign a vendor to an order item and mark order as ASSIGNED
 */
router.post("/assign/:orderItemId", async (req: Request, res: Response) => {
  try {
    const { orderItemId } = req.params;
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: "vendorId is required" });
    }

    const updatedItem = await prisma.orderItem.update({
      where: { id: typeof orderItemId === 'string' ? orderItemId : '' },
      data: { vendorId },
    });

    // Update order status to ASSIGNED
    await prisma.order.update({
      where: { id: updatedItem.orderId },
      data: { status: "ASSIGNED" },
    });

    res.json({ success: true, data: updatedItem });
  } catch (error) {
    console.error("ASSIGN VENDOR ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to assign vendor" });
  }
});

/**
 * PATCH /api/admin/orders/:orderId/status
 * Body: { status: OrderStatus }
 * Update order status (ADMIN action)
 */
router.patch('/:orderId/status', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'status is required' });
    }

    // Validate status against enum values
    const allowed = [
      'PLACED', 'CONFIRMED', 'ASSIGNED', 'PRINTING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const updated = await prisma.order.update({
      where: { id: typeof orderId === 'string' ? orderId : '' },
      data: { status: status as any },
      include: {
        user: true,
        items: { include: { size: true, vendor: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('UPDATE ORDER STATUS ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to update order status' });
  }
});

export default router;

/**
 * GET /api/admin/orders/:orderId/designs
 * Retrieve all design files (image, mockup, PDF) for an order
 * Admin can view customer designs and see vendor assignments
 */
router.get("/:orderId/designs", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required" });
    }

    const order = await prisma.order.findUnique({
      where: { id: typeof orderId === 'string' ? orderId : '' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
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
      return res.status(404).json({ success: false, message: "Order not found" });
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
        status: order.status,
        createdAt: order.createdAt,
      },
      items: itemsWithDesigns,
      hasDesigns: itemsWithDesigns.some(
        (item: any) =>
          item.design.imageUrl ||
          item.design.mockupUrl ||
          item.design.pdfUrl
      ),
    });
  } catch (error) {
    console.error("GET ORDER DESIGNS ERROR:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch order designs" });
  }
});
