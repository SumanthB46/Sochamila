import { Router, Request, Response } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import {
  getCustomerProfile,
  getCustomerOrders,
  getCustomerStats,
  getCustomerAddresses,
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress
} from "./customer.controller";

const router = Router();

/* =========================================================
   CUSTOMER ENDPOINTS (PROTECTED - CUSTOMER ROLE)
========================================================= */


/**
 * PUT /api/customer/profile
 * @description Update customer profile (name, email)
 * @requires CUSTOMER or ADMIN role
 */
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => require("./customer.controller").updateCustomerProfile(req, res)
);

/**
 * GET /api/customer/profile
 * @description Get customer profile
 * @requires CUSTOMER or ADMIN role
 * @returns Customer profile data
 */
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => getCustomerProfile(req, res)
);

/**
 * GET /api/customer/orders
 * @description Get customer's orders
 * @requires CUSTOMER or ADMIN role
 * @returns Customer's orders with items
 */
router.get(
  "/orders",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => getCustomerOrders(req, res)
);

/**
 * GET /api/customer/stats
 * @description Get customer statistics
 * @requires CUSTOMER or ADMIN role
 * @returns Customer stats (total orders, spending, etc.)
 */
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => getCustomerStats(req, res)
);

/**
 * GET /api/customer/addresses
 * @description Get customer's saved addresses
 * @requires CUSTOMER or ADMIN role
 */
router.get(
  "/addresses",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => getCustomerAddresses(req, res)
);

/**
 * POST /api/customer/addresses
 * @description Add a new address
 * @requires CUSTOMER or ADMIN role
 */
router.post(
  "/addresses",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => createCustomerAddress(req, res)
);

/**
 * PUT /api/customer/addresses/:id
 * @description Update an existing address
 * @requires CUSTOMER or ADMIN role
 */
router.put(
  "/addresses/:id",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => updateCustomerAddress(req, res)
);

/**
 * DELETE /api/customer/addresses/:id
 * @description Delete an address
 * @requires CUSTOMER or ADMIN role
 */
router.delete(
  "/addresses/:id",
  authMiddleware,
  roleMiddleware([Role.CUSTOMER, Role.ADMIN]),
  (req: Request, res: Response) => deleteCustomerAddress(req, res)
);

export default router;
