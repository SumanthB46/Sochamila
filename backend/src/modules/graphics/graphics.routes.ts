import { Router, Request, Response } from "express";
import { upload } from "../../middlewares/upload.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import {
  getGraphics,
  getGraphicById_controller,
  uploadGraphics,
  deleteGraphic_controller,
  deleteMultipleGraphics_controller,
} from "./graphics.controller";

const router = Router();

/* =========================================================
   PUBLIC ENDPOINTS
========================================================= */

/**
 * GET /api/graphics
 * @description Get all graphics
 * @returns {Array} Array of graphics
 * @public
 */
router.get("/", (req: Request, res: Response) =>
  getGraphics(req, res)
);

/**
 * GET /api/graphics/:id
 * @description Get a specific graphic by ID
 * @param {string} id - Graphic ID
 * @returns {Object} Graphic object
 * @public
 */
router.get("/:id", (req: Request, res: Response) =>
  getGraphicById_controller(req, res)
);

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
router.post(
  "/upload",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  upload.array("files", 50),
  (req: Request, res: Response) => uploadGraphics(req, res)
);

/**
 * DELETE /api/graphics/:id
 * @description Delete a specific graphic (Admin only)
 * @param {string} id - Graphic ID
 * @requires ADMIN role
 * @returns {Object} Deleted graphic object
 */
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  (req: Request, res: Response) => deleteGraphic_controller(req, res)
);

/**
 * DELETE /api/graphics/batch
 * @description Delete multiple graphics (Admin only)
 * @body {Object} { ids: string[] } - Array of graphic IDs (max 100)
 * @requires ADMIN role
 * @returns {Object} Deletion result with count
 */
router.delete(
  "/batch",
  authMiddleware,
  roleMiddleware([Role.ADMIN]),
  (req: Request, res: Response) => deleteMultipleGraphics_controller(req, res)
);

export default router;
