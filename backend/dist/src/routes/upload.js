"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const imagekit_1 = require("../lib/imagekit");
const router = (0, express_1.Router)();
/* =====================================================
   MULTER CONFIG (MEMORY)
===================================================== */
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
/* =====================================================
   GET /api/uploads (Health Check)
===================================================== */
router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Upload endpoint is ready",
    });
});
/* =====================================================
   POST /api/uploads
===================================================== */
router.post("/", upload.single("file"), async (req, res) => {
    try {
        console.log("[UPLOAD] File upload request received");
        console.log("[UPLOAD] File:", req.file ? { name: req.file.originalname, size: req.file.size } : "None");
        if (!req.file) {
            console.log("[UPLOAD] No file provided");
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        console.log("[UPLOAD] Starting ImageKit upload...");
        /* 🔥 ImageKit REQUIRES base64 string */
        const result = await imagekit_1.imagekit.upload({
            file: req.file.buffer.toString("base64"),
            fileName: req.file.originalname,
            folder: "/sochamila/uploads",
            useUniqueFileName: true,
        });
        console.log("[UPLOAD] ImageKit upload successful:", result.url);
        return res.status(200).json({
            success: true,
            url: result.url,
            fileId: result.fileId,
        });
    }
    catch (err) {
        console.error("[UPLOAD] ImageKit upload error:", err);
        return res.status(500).json({
            success: false,
            message: "Upload failed: " + (err instanceof Error ? err.message : String(err)),
        });
    }
});
exports.default = router;
