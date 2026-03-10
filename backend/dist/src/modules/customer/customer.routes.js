"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const customer_controller_1 = require("./customer.controller");
const router = (0, express_1.Router)();
/* =========================================================
   CUSTOMER ENDPOINTS (PROTECTED - CUSTOMER ROLE)
========================================================= */
/**
 * PUT /api/customer/profile
 * @description Update customer profile (name, email)
 * @requires CUSTOMER or ADMIN role
 */
router.put("/profile", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.CUSTOMER, client_1.Role.ADMIN]), (req, res) => require("./customer.controller").updateCustomerProfile(req, res));
/**
 * GET /api/customer/profile
 * @description Get customer profile
 * @requires CUSTOMER or ADMIN role
 * @returns Customer profile data
 */
router.get("/profile", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.CUSTOMER, client_1.Role.ADMIN]), (req, res) => (0, customer_controller_1.getCustomerProfile)(req, res));
/**
 * GET /api/customer/orders
 * @description Get customer's orders
 * @requires CUSTOMER or ADMIN role
 * @returns Customer's orders with items
 */
router.get("/orders", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.CUSTOMER, client_1.Role.ADMIN]), (req, res) => (0, customer_controller_1.getCustomerOrders)(req, res));
/**
 * GET /api/customer/stats
 * @description Get customer statistics
 * @requires CUSTOMER or ADMIN role
 * @returns Customer stats (total orders, spending, etc.)
 */
router.get("/stats", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.CUSTOMER, client_1.Role.ADMIN]), (req, res) => (0, customer_controller_1.getCustomerStats)(req, res));
exports.default = router;
