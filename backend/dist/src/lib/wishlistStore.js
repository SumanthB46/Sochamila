"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWishlist = getWishlist;
exports.addWishlistItem = addWishlistItem;
exports.removeWishlistItem = removeWishlistItem;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, "..", "..", "data");
const FILE = path_1.default.join(DATA_DIR, "user-wishlists.json");
function ensureFile() {
    try {
        if (!fs_1.default.existsSync(DATA_DIR))
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        if (!fs_1.default.existsSync(FILE))
            fs_1.default.writeFileSync(FILE, JSON.stringify({}), "utf-8");
    }
    catch (err) {
        console.error("[WISHLIST] Failed to ensure data file:", err);
    }
}
function readAll() {
    try {
        ensureFile();
        const raw = fs_1.default.readFileSync(FILE, "utf-8");
        return JSON.parse(raw || "{}");
    }
    catch (err) {
        console.error("[WISHLIST] Read error:", err);
        return {};
    }
}
function writeAll(data) {
    try {
        ensureFile();
        fs_1.default.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    catch (err) {
        console.error("[WISHLIST] Write error:", err);
    }
}
function getWishlist(userId) {
    const all = readAll();
    return all[userId] || [];
}
function addWishlistItem(userId, item) {
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
function removeWishlistItem(userId, itemId) {
    const all = readAll();
    const list = (all[userId] || []).filter((i) => i.id !== itemId);
    all[userId] = list;
    writeAll(all);
    return list;
}
