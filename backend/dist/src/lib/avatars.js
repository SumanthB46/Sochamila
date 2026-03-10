"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAvatar = getAvatar;
exports.setAvatar = setAvatar;
exports.removeAvatar = removeAvatar;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DATA_DIR = path_1.default.join(__dirname, "..", "..", "data");
const FILE = path_1.default.join(DATA_DIR, "user-avatars.json");
function ensureFile() {
    try {
        if (!fs_1.default.existsSync(DATA_DIR))
            fs_1.default.mkdirSync(DATA_DIR, { recursive: true });
        if (!fs_1.default.existsSync(FILE))
            fs_1.default.writeFileSync(FILE, JSON.stringify({}), "utf-8");
    }
    catch (err) {
        console.error("[AVATARS] Failed to ensure data file:", err);
    }
}
function readAll() {
    try {
        ensureFile();
        const raw = fs_1.default.readFileSync(FILE, "utf-8");
        return JSON.parse(raw || "{}");
    }
    catch (err) {
        console.error("[AVATARS] Read error:", err);
        return {};
    }
}
function writeAll(data) {
    try {
        ensureFile();
        fs_1.default.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
    }
    catch (err) {
        console.error("[AVATARS] Write error:", err);
    }
}
function getAvatar(userId) {
    const all = readAll();
    return all[userId] || null;
}
function setAvatar(userId, url) {
    const all = readAll();
    all[userId] = url;
    writeAll(all);
}
function removeAvatar(userId) {
    const all = readAll();
    delete all[userId];
    writeAll(all);
}
