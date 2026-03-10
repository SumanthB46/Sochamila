import { Request, Response } from "express";
import {
  getCustomerProfileService,
  getCustomerOrdersService,
  getCustomerStatsService,
  updateCustomerProfileService,
  getCustomerAddressesService,
  createCustomerAddressService,
  updateCustomerAddressService,
  deleteCustomerAddressService,
} from "./customer.service";

/**
 * Get customer profile
 */
export async function getCustomerProfile(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerProfileService(customerId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer profile",
    });
  }
}

/**
 * Get customer orders
 */
export async function getCustomerOrders(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerOrdersService(customerId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer orders",
    });
  }
}

/**
 * Get customer stats
 */
export async function getCustomerStats(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await getCustomerStatsService(customerId);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer stats",
    });
  }
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, email, avatarUrl } = req.body;
    const updated = await updateCustomerProfileService(customerId, { name, email, avatarUrl });

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error("[CUSTOMER] Error updating profile:", error);
    res.status(500).json({ success: false, message: "Failed to update profile" });
  }
}

/**
 * Get customer addresses
 */
export async function getCustomerAddresses(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getCustomerAddressesService(customerId);
    res.json({ success: true, data });
  } catch (error) {
    console.error("[CUSTOMER] Error fetching addresses:", error);
    res.status(500).json({ success: false, message: "Failed to fetch addresses" });
  }
}

/**
 * Create customer address
 */
export async function createCustomerAddress(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await createCustomerAddressService(customerId, req.body);
    res.json({ success: true, data });
  } catch (error) {
    console.error("[CUSTOMER] Error creating address:", error);
    res.status(500).json({ success: false, message: "Failed to create address" });
  }
}

/**
 * Update customer address
 */
export async function updateCustomerAddress(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;
    const addressId = req.params.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await updateCustomerAddressService(customerId, addressId, req.body);
    res.json({ success: true, data });
  } catch (error) {
    console.error("[CUSTOMER] Error updating address:", error);
    res.status(500).json({ success: false, message: "Failed to update address" });
  }
}

/**
 * Delete customer address
 */
export async function deleteCustomerAddress(req: Request, res: Response) {
  try {
    const customerId = req.user?.id;
    const addressId = req.params.id;

    if (!customerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await deleteCustomerAddressService(customerId, addressId);
    res.json({ success: true, message: "Address deleted successfully" });
  } catch (error) {
    console.error("[CUSTOMER] Error deleting address:", error);
    res.status(500).json({ success: false, message: "Failed to delete address" });
  }
}
