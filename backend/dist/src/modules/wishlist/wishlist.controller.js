"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = getWishlist;
exports.addWishlistItem = addWishlistItem;
exports.removeWishlistItemController = removeWishlistItemController;
const wishlist_service_1 = require("./wishlist.service");
async function getWishlist(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: "Unauthorized" });
        const data = await (0, wishlist_service_1.getUserWishlistService)(userId);
        return res.json({ success: true, data });
    }
    catch (err) {
        console.error("[WISHLIST] Get error:", err);
        return res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
    }
}
async function addWishlistItem(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: "Unauthorized" });
        const { id, title } = req.body;
        if (!id || !title)
            return res.status(400).json({ success: false, message: "Missing id/title" });
        const updated = await (0, wishlist_service_1.addUserWishlistService)(userId, { id, title });
        return res.status(201).json({ success: true, data: updated });
    }
    catch (err) {
        console.error("[WISHLIST] Add error:", err);
        return res.status(500).json({ success: false, message: "Failed to add wishlist item" });
    }
}
async function removeWishlistItemController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ success: false, message: "Unauthorized" });
        const itemId = req.params.id;
        const updated = await (0, wishlist_service_1.removeUserWishlistService)(userId, typeof itemId === 'string' ? itemId : '');
        return res.json({ success: true, data: updated });
    }
    catch (err) {
        console.error("[WISHLIST] Remove error:", err);
        return res.status(500).json({ success: false, message: "Failed to remove wishlist item" });
    }
}
