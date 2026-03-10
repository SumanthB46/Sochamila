"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleGraphics = exports.deleteGraphic = exports.createGraphics = exports.getGraphicById = exports.getAllGraphics = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
/* =========================================================
   GET ALL GRAPHICS
========================================================= */
const getAllGraphics = async () => {
    try {
        return await prisma_1.default.graphic.findMany({
            orderBy: {
                createdAt: "desc",
            },
            select: {
                id: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    catch (error) {
        console.error("[GraphicsService] getAllGraphics error:", error);
        throw new Error("Failed to fetch graphics");
    }
};
exports.getAllGraphics = getAllGraphics;
/* =========================================================
   GET GRAPHIC BY ID
========================================================= */
const getGraphicById = async (id) => {
    if (!id || typeof id !== "string") {
        throw new Error("Invalid graphic ID");
    }
    try {
        return await prisma_1.default.graphic.findUnique({
            where: { id },
            select: {
                id: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    catch (error) {
        console.error("[GraphicsService] getGraphicById error:", error);
        throw new Error("Failed to fetch graphic");
    }
};
exports.getGraphicById = getGraphicById;
/* =========================================================
   CREATE GRAPHICS (UPLOAD)
========================================================= */
const createGraphics = async (files) => {
    // Validation
    if (!files || !Array.isArray(files) || files.length === 0) {
        throw new Error("No files provided");
    }
    if (files.length > 50) {
        throw new Error("Maximum 50 files allowed per upload");
    }
    // Validate each file
    for (const file of files) {
        if (!file.filename) {
            throw new Error("Invalid file: missing filename");
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new Error(`File ${file.filename} exceeds 10MB limit`);
        }
    }
    try {
        // Use transaction for atomicity
        const graphics = await prisma_1.default.$transaction(files.map((file) => prisma_1.default.graphic.create({
            data: {
                imageUrl: `/uploads/${file.filename}`,
            },
            select: {
                id: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        })));
        console.log(`[GraphicsService] Successfully created ${graphics.length} graphics`);
        return graphics;
    }
    catch (error) {
        console.error("[GraphicsService] createGraphics error:", error);
        throw new Error("Failed to upload graphics");
    }
};
exports.createGraphics = createGraphics;
/* =========================================================
   DELETE GRAPHIC
========================================================= */
const deleteGraphic = async (id) => {
    if (!id || typeof id !== "string") {
        throw new Error("Invalid graphic ID");
    }
    try {
        const graphic = await prisma_1.default.graphic.findUnique({
            where: { id },
        });
        if (!graphic) {
            throw new Error("Graphic not found");
        }
        const deleted = await prisma_1.default.graphic.delete({
            where: { id },
            select: {
                id: true,
                imageUrl: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        console.log(`[GraphicsService] Deleted graphic: ${id}`);
        return deleted;
    }
    catch (error) {
        console.error("[GraphicsService] deleteGraphic error:", error);
        if (error instanceof Error && error.message === "Graphic not found") {
            throw error;
        }
        throw new Error("Failed to delete graphic");
    }
};
exports.deleteGraphic = deleteGraphic;
/* =========================================================
   DELETE MULTIPLE GRAPHICS
========================================================= */
const deleteMultipleGraphics = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("No IDs provided");
    }
    if (ids.length > 100) {
        throw new Error("Maximum 100 items can be deleted at once");
    }
    if (!ids.every((id) => typeof id === "string" && id.length > 0)) {
        throw new Error("Invalid IDs provided");
    }
    try {
        const result = await prisma_1.default.graphic.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
        console.log(`[GraphicsService] Deleted ${result.count} graphics`);
        return { deletedCount: result.count };
    }
    catch (error) {
        console.error("[GraphicsService] deleteMultipleGraphics error:", error);
        throw new Error("Failed to delete graphics");
    }
};
exports.deleteMultipleGraphics = deleteMultipleGraphics;
