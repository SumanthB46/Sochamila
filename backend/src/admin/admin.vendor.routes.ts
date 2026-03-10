import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/admin/vendors - list vendors (id, name, email)
router.get("/", async (req: Request, res: Response) => {
  try {
    const vendors = await prisma.user.findMany({
      where: { role: "VENDOR" },
      select: { id: true, name: true, email: true, kycStatus: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error("ADMIN VENDORS LIST ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch vendors" });
  }
});

// GET /api/admin/vendors/:id - vendor details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.user.findUnique({
      where: { id: typeof id === 'string' ? id : '' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        kycStatus: true,
        createdAt: true,
        assignedOrderItems: {
          include: { order: true, size: true },
        },
      },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error('ADMIN VENDOR DETAIL ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor' });
  }
});

// PATCH /api/admin/vendors/:id/kyc - update KYC status (APPROVED|REJECTED)
router.patch('/:id/kyc', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kycStatus } = req.body;

    if (!kycStatus || !['APPROVED', 'REJECTED', 'PENDING'].includes(kycStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid kycStatus' });
    }

    const updated = await prisma.user.update({
      where: { id: typeof id === 'string' ? id : '' },
      data: {
        kycStatus: kycStatus as any,
        isActive: kycStatus === 'APPROVED' ? true : undefined,
      },
      select: { id: true, name: true, email: true, kycStatus: true, isActive: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('UPDATE VENDOR KYC ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to update vendor' });
  }
});

// GET /api/admin/vendors/:id/stats - vendor statistics (orders, revenue)
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get assigned order items for this vendor
    const assignedItems = await prisma.orderItem.findMany({
      where: { vendorId: typeof id === 'string' ? id : '' },
      include: {
        order: { select: { totalAmount: true, status: true } },
      },
    });

    // Calculate statistics
    let totalRevenue = 0;
    let totalOrders = new Set<string>();

    assignedItems.forEach((item: any) => {
      // Count total orders
      totalOrders.add(item.orderId);

      // Add the item price to revenue (price is already stored in OrderItem)
      totalRevenue += item.price * item.quantity;
    });

    const totalOrdersCount = totalOrders.size;
    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    res.json({
      success: true,
      data: {
        totalOrders: totalOrdersCount,
        totalRevenue: Math.round(totalRevenue),
        avgOrderValue: avgOrderValue,
      },
    });
  } catch (error) {
    console.error('VENDOR STATS ERROR:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch vendor stats' });
  }
});

export default router;
