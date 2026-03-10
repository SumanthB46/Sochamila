import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const FILE = path.join(DATA_DIR, "user-wishlists.json");

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}), "utf-8");
  } catch (err) {
    console.error("[WISHLIST] Failed to ensure data file:", err);
  }
}

function readAll(): Record<string, Array<{ id: string; title: string }>> {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[WISHLIST] Read error:", err);
    return {};
  }
}

function writeAll(data: Record<string, Array<{ id: string; title: string }>>) {
  try {
    ensureFile();
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[WISHLIST] Write error:", err);
  }
}

export function getWishlist(userId: string) {
  const all = readAll();
  return all[userId] || [];
}

export function addWishlistItem(userId: string, item: { id: string; title: string }) {
  const all = readAll();
  const list = all[userId] || [];
  // avoid duplicates
  if (!list.find((i) => i.id === item.id)) {
    list.unshift(item);
  }
  all[userId] = list;
  writeAll(all);
  return all[userId];
}

export function removeWishlistItem(userId: string, itemId: string) {
  const all = readAll();
  const list = (all[userId] || []).filter((i) => i.id !== itemId);
  all[userId] = list;
  writeAll(all);
  return list;
}
