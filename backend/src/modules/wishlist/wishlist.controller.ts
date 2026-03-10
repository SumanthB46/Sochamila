import { Request, Response } from "express";
import {
  getUserWishlistService,
  addUserWishlistService,
  removeUserWishlistService,
} from "./wishlist.service";

export async function getWishlist(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const data = await getUserWishlistService(userId);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("[WISHLIST] Get error:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
}

export async function addWishlistItem(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const { id, title } = req.body;
    if (!id || !title) return res.status(400).json({ success: false, message: "Missing id/title" });
    const updated = await addUserWishlistService(userId, { id, title });
    return res.status(201).json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[WISHLIST] Add error:", err);
    return res.status(500).json({ success: false, message: "Failed to add wishlist item" });
  }
}

export async function removeWishlistItemController(req: Request, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    const itemId = req.params.id;
    const updated = await removeUserWishlistService(userId, typeof itemId === 'string' ? itemId : '');
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[WISHLIST] Remove error:", err);
    return res.status(500).json({ success: false, message: "Failed to remove wishlist item" });
  }
}
