import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware";
import * as controller from "./sticker.controller";

const router = Router();

/* ===============================
   STICKERS ROUTES (ADMIN)
================================ */

// Get all stickers
router.get("/", controller.getAll);

// Upload stickers (multipart/form-data)
router.post(
  "/upload",
  upload.array("files", 20), // 🔥 REQUIRED
  controller.upload
);

// Toggle enable / disable
router.patch("/:id/toggle", controller.toggle);

// Move to category
router.patch("/:id/category", controller.moveToCategory);

// Delete sticker permanently
router.delete("/:id", controller.remove);

export default router;
