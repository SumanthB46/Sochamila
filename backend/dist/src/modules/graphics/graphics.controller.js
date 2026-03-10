"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMultipleGraphics_controller = exports.deleteGraphic_controller = exports.uploadGraphics = exports.getGraphicById_controller = exports.getGraphics = void 0;
const graphics_service_1 = require("./graphics.service");
/* =========================================================
   GET ALL GRAPHICS (PUBLIC)
========================================================= */
const getGraphics = async (_req, res) => {
    try {
        console.log("[GraphicsController] GET /graphics");
        const graphics = await (0, graphics_service_1.getAllGraphics)();
        const response = {
            success: true,
            message: "Graphics fetched successfully",
            data: graphics,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("[GraphicsController] getGraphics error:", error);
        const response = {
            success: false,
            message: "Failed to fetch graphics",
            error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
    }
};
exports.getGraphics = getGraphics;
/* =========================================================
   GET GRAPHIC BY ID (PUBLIC)
========================================================= */
const getGraphicById_controller = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!id) {
            const response = {
                success: false,
                message: "Graphic ID is required",
            };
            res.status(400).json(response);
            return;
        }
        console.log(`[GraphicsController] GET /graphics/${id}`);
        const graphic = await (0, graphics_service_1.getGraphicById)(id);
        if (!graphic) {
            const response = {
                success: false,
                message: "Graphic not found",
            };
            res.status(404).json(response);
            return;
        }
        const response = {
            success: true,
            message: "Graphic fetched successfully",
            data: graphic,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("[GraphicsController] getGraphicById error:", error);
        const response = {
            success: false,
            message: "Failed to fetch graphic",
            error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
    }
};
exports.getGraphicById_controller = getGraphicById_controller;
/* =========================================================
   UPLOAD GRAPHICS (ADMIN)
========================================================= */
const uploadGraphics = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            const response = {
                success: false,
                message: "No files provided",
            };
            res.status(400).json(response);
            return;
        }
        console.log(`[GraphicsController] POST /graphics/upload - ${files.length} files`);
        const graphics = await (0, graphics_service_1.createGraphics)(files);
        const response = {
            success: true,
            message: `Successfully uploaded ${graphics.length} graphics`,
            data: graphics,
        };
        res.status(201).json(response);
    }
    catch (error) {
        console.error("[GraphicsController] uploadGraphics error:", error);
        const statusCode = error instanceof Error && error.message.includes("No files")
            ? 400
            : error instanceof Error && error.message.includes("exceeds")
                ? 413
                : 500;
        const response = {
            success: false,
            message: "Failed to upload graphics",
            error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(statusCode).json(response);
    }
};
exports.uploadGraphics = uploadGraphics;
/* =========================================================
   DELETE GRAPHIC (ADMIN)
========================================================= */
const deleteGraphic_controller = async (req, res) => {
    try {
        const id = String(req.params.id);
        if (!id) {
            const response = {
                success: false,
                message: "Graphic ID is required",
            };
            res.status(400).json(response);
            return;
        }
        console.log(`[GraphicsController] DELETE /graphics/${id}`);
        const deleted = await (0, graphics_service_1.deleteGraphic)(id);
        const response = {
            success: true,
            message: "Graphic deleted successfully",
            data: deleted,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("[GraphicsController] deleteGraphic error:", error);
        const statusCode = error instanceof Error && error.message === "Graphic not found"
            ? 404
            : 500;
        const response = {
            success: false,
            message: "Failed to delete graphic",
            error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(statusCode).json(response);
    }
};
exports.deleteGraphic_controller = deleteGraphic_controller;
/* =========================================================
   DELETE MULTIPLE GRAPHICS (ADMIN)
========================================================= */
const deleteMultipleGraphics_controller = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            const response = {
                success: false,
                message: "Graphic IDs array is required",
            };
            res.status(400).json(response);
            return;
        }
        console.log(`[GraphicsController] DELETE /graphics/batch - ${ids.length} items`);
        const result = await (0, graphics_service_1.deleteMultipleGraphics)(ids);
        const response = {
            success: true,
            message: `Successfully deleted ${result.deletedCount} graphics`,
            data: result,
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error("[GraphicsController] deleteMultipleGraphics error:", error);
        const response = {
            success: false,
            message: "Failed to delete graphics",
            error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
    }
};
exports.deleteMultipleGraphics_controller = deleteMultipleGraphics_controller;
