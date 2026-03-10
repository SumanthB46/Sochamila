import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { roleMiddleware } from "../../middlewares/role.middleware";
import { Role } from "@prisma/client";
import { getWishlist, addWishlistItem, removeWishlistItemController } from "./wishlist.controller";

const router = Router();

router.get("/", authMiddleware, roleMiddleware([Role.CUSTOMER, Role.ADMIN]), (req, res) => getWishlist(req, res));
router.post("/", authMiddleware, roleMiddleware([Role.CUSTOMER, Role.ADMIN]), (req, res) => addWishlistItem(req, res));
router.delete("/:id", authMiddleware, roleMiddleware([Role.CUSTOMER, Role.ADMIN]), (req, res) => removeWishlistItemController(req, res));

export default router;
