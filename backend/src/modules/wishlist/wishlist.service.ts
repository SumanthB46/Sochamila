import { getWishlist, addWishlistItem, removeWishlistItem } from "../../lib/wishlistStore";

export async function getUserWishlistService(userId: string) {
  return getWishlist(userId);
}

export async function addUserWishlistService(userId: string, item: { id: string; title: string }) {
  return addWishlistItem(userId, item);
}

export async function removeUserWishlistService(userId: string, itemId: string) {
  return removeWishlistItem(userId, itemId);
}
