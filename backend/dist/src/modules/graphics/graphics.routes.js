"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const graphics_controller_1 = require("./graphics.controller");
const router = (0, express_1.Router)();
/* =========================================================
   PUBLIC ENDPOINTS
========================================================= */
/**
 * GET /api/graphics
 * @description Get all graphics
 * @returns {Array} Array of graphics
 * @public
 */
router.get("/", (req, res) => (0, graphics_controller_1.getGraphics)(req, res));
/**
 * GET /api/graphics/:id
 * @description Get a specific graphic by ID
 * @param {string} id - Graphic ID
 * @returns {Object} Graphic object
 * @public
 */
router.get("/:id", (req, res) => (0, graphics_controller_1.getGraphicById_controller)(req, res));
/* =========================================================
   ADMIN ENDPOINTS (PROTECTED)
========================================================= */
/**
 * POST /api/graphics/upload
 * @description Upload multiple graphics (Admin only)
 * @param {File[]} files - Image files to upload (max 50)
 * @requires ADMIN role
 * @returns {Array} Array of created graphics
 */
router.post("/upload", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]), upload_middleware_1.upload.array("files", 50), (req, res) => (0, graphics_controller_1.uploadGraphics)(req, res));
/**
 * DELETE /api/graphics/:id
 * @description Delete a specific graphic (Admin only)
 * @param {string} id - Graphic ID
 * @requires ADMIN role
 * @returns {Object} Deleted graphic object
 */
router.delete("/:id", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]), (req, res) => (0, graphics_controller_1.deleteGraphic_controller)(req, res));
/**
 * DELETE /api/graphics/batch
 * @description Delete multiple graphics (Admin only)
 * @body {Object} { ids: string[] } - Array of graphic IDs (max 100)
 * @requires ADMIN role
 * @returns {Object} Deletion result with count
 */
router.delete("/batch", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]), (req, res) => (0, graphics_controller_1.deleteMultipleGraphics_controller)(req, res));
exports.default = router;
