"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_middleware_1 = require("../../middlewares/upload.middleware");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const role_middleware_1 = require("../../middlewares/role.middleware");
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const router = (0, express_1.Router)();
/* ================= PUBLIC ================= */
// GET /api/graphics
router.get("/", async (_req, res) => {
    const graphics = await prisma_1.default.graphic.findMany({
        orderBy: { createdAt: "desc" },
    });
    res.json(graphics);
});
/* ================= ADMIN ================= */
// POST /api/admin/graphics/upload
router.post("/upload", auth_middleware_1.authMiddleware, (0, role_middleware_1.roleMiddleware)([client_1.Role.ADMIN]), upload_middleware_1.upload.array("files"), async (req, res) => {
    const files = req.files;
    await prisma_1.default.graphic.createMany({
        data: files.map((f) => ({
            imageUrl: `/uploads/${f.filename}`,
        })),
    });
    res.json({ success: true });
});
exports.default = router;
