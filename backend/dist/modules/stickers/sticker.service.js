"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.toggle = exports.upload = exports.getAll = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
/* ===============================
   GET ALL STICKERS
================================ */
const getAll = () => {
    return prisma_1.default.sticker.findMany({
        include: {
            category: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getAll = getAll;
/* ===============================
   UPLOAD STICKERS
================================ */
const upload = async (files, categoryId) => {
    return prisma_1.default.$transaction(files.map((file) => prisma_1.default.sticker.create({
        data: {
            name: file.originalname,
            imageUrl: `/uploads/${file.filename}`,
            isActive: true,
            usageCount: 0,
            category: {
                connect: { id: categoryId }, // ✅ CORRECT PRISMA RELATION
            },
        },
    })));
};
exports.upload = upload;
/* ===============================
   TOGGLE ENABLE / DISABLE
================================ */
const toggle = async (id) => {
    const sticker = await prisma_1.default.sticker.findUnique({
        where: { id },
    });
    if (!sticker) {
        throw new Error("Sticker not found");
    }
    return prisma_1.default.sticker.update({
        where: { id },
        data: {
            isActive: !sticker.isActive,
        },
    });
};
exports.toggle = toggle;
/* ===============================
   DELETE STICKER
================================ */
const remove = (id) => {
    return prisma_1.default.sticker.delete({
        where: { id },
    });
};
exports.remove = remove;
