import { Request, Response } from "express";
import prisma from "../../lib/prisma";
import {
  getVendorDashboardService,
  getVendorOrdersService,
  getVendorStatsService,
  updateOrderStatusService,
} from "./vendor.service";

/**
 * Get vendor dashboard data
 */
export async function getVendorDashboard(req: Request, res: Response) {
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

    const data = await getVendorDashboardService(vendorId);
    
    console.log("[VENDOR-CONTROLLER] Dashboard service returned successfully");
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
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
export async function getVendorOrders(req: Request, res: Response) {
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
    const data = await getVendorOrdersService(vendorId);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
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
export async function getVendorStats(req: Request, res: Response) {
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
    const data = await getVendorStatsService(vendorId);
    res.json({
      success: true,
      data,
    });
  } catch (error: any) {
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
export async function updateOrderStatus(req: Request, res: Response) {
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

    const data = await updateOrderStatusService(vendorId, orderId, status);
    
    res.json({
      success: true,
      data,
      message: "Order status updated successfully",
    });
  } catch (error: any) {
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
export async function getVendorAssignedDesigns(req: Request, res: Response) {
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
    const assignedItems = await prisma.orderItem.findMany({
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
    const designs = assignedItems.map((item: any) => ({
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
      hasDesigns:
        Boolean(item.imageUrl) ||
        Boolean(item.mockupUrl) ||
        Boolean(item.pdfUrl),
    }));

    res.json({
      success: true,
      data: designs,
      totalAssignedDesigns: designs.length,
      designsWithFiles: designs.filter((d: any) => d.hasDesigns).length,
    });
  } catch (error: any) {
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

