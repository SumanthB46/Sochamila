"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
/* ================= UPLOAD DIRECTORY ================= */
// This resolves to: <project_root>/uploads
const uploadDir = path_1.default.join(process.cwd(), "uploads");
// Ensure uploads folder exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
/* ================= STORAGE ================= */
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueName}${path_1.default.extname(file.originalname)}`);
    },
});
/* ================= FILE FILTER ================= */
const fileFilter = (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
        cb(new Error("Only image files are allowed"));
        return;
    }
    cb(null, true);
};
/* ================= MULTER INSTANCE ================= */
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
