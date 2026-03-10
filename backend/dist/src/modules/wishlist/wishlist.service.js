"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWishlistService = getUserWishlistService;
exports.addUserWishlistService = addUserWishlistService;
exports.removeUserWishlistService = removeUserWishlistService;
const wishlistStore_1 = require("../../lib/wishlistStore");
async function getUserWishlistService(userId) {
    return (0, wishlistStore_1.getWishlist)(userId);
}
async function addUserWishlistService(userId, item) {
    return (0, wishlistStore_1.addWishlistItem)(userId, item);
}
async function removeUserWishlistService(userId, itemId) {
    return (0, wishlistStore_1.removeWishlistItem)(userId, itemId);
}
