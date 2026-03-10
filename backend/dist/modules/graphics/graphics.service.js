"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGraphics = exports.getAllGraphics = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
/* =========================================================
   GET ALL GRAPHICS
========================================================= */
const getAllGraphics = async () => {
    return prisma_1.default.graphic.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });
};
exports.getAllGraphics = getAllGraphics;
/* =========================================================
   CREATE GRAPHICS (UPLOAD)
========================================================= */
const createGraphics = async (files) => {
    if (!files || !files.length)
        return [];
    const graphics = await Promise.all(files.map((file) => prisma_1.default.graphic.create({
        data: {
            imageUrl: `/uploads/${file.filename}`,
        },
    })));
    return graphics;
};
exports.createGraphics = createGraphics;
