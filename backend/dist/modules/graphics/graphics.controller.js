"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadGraphics = exports.getGraphics = void 0;
const graphics_service_1 = require("./graphics.service");
const getGraphics = async (req, res) => {
    try {
        const graphics = await (0, graphics_service_1.getAllGraphics)();
        res.json(graphics);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to load graphics" });
    }
};
exports.getGraphics = getGraphics;
const uploadGraphics = async (req, res) => {
    try {
        const files = req.files;
        const graphics = await (0, graphics_service_1.createGraphics)(files);
        res.json(graphics);
    }
    catch (error) {
        res.status(500).json({ message: "Upload failed" });
    }
};
exports.uploadGraphics = uploadGraphics;
