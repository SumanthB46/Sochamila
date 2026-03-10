import fs from "fs";
import path from "path";

const DATA_DIR = path.join(__dirname, "..", "..", "data");
const FILE = path.join(DATA_DIR, "user-avatars.json");

function ensureFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, JSON.stringify({}), "utf-8");
  } catch (err) {
    console.error("[AVATARS] Failed to ensure data file:", err);
  }
}

function readAll(): Record<string, string> {
  try {
    ensureFile();
    const raw = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[AVATARS] Read error:", err);
    return {};
  }
}

function writeAll(data: Record<string, string>) {
  try {
    ensureFile();
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[AVATARS] Write error:", err);
  }
}

export function getAvatar(userId: string): string | null {
  const all = readAll();
  return all[userId] || null;
}

export function setAvatar(userId: string, url: string) {
  const all = readAll();
  all[userId] = url;
  writeAll(all);
}

export function removeAvatar(userId: string) {
  const all = readAll();
  delete all[userId];
  writeAll(all);
}
