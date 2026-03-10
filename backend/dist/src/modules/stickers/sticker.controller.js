"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.moveToCategory = exports.toggle = exports.upload = exports.getAll = void 0;
const StickerService = __importStar(require("./sticker.service"));
/* ===============================
   GET ALL STICKERS
================================ */
const getAll = async (_req, res) => {
    try {
        const data = await StickerService.getAll();
        res.json(data);
    }
    catch (error) {
        console.error("Get stickers error:", error);
        res.status(500).json({ message: "Failed to get stickers" });
    }
};
exports.getAll = getAll;
/* ===============================
   UPLOAD STICKERS
================================ */
const upload = async (req, res) => {
    try {
        const files = req.files;
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).json({
                message: "categoryId is required",
            });
        }
        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "No files uploaded",
            });
        }
        const result = await StickerService.upload(files, categoryId);
        res.json(result);
    }
    catch (error) {
        console.error("Upload stickers error:", error);
        res.status(500).json({ message: "Failed to upload stickers" });
    }
};
exports.upload = upload;
/* ===============================
   TOGGLE ENABLE / DISABLE
================================ */
const toggle = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const data = await StickerService.toggle(id);
        res.json(data);
    }
    catch (error) {
        console.error("Toggle sticker error:", error);
        res.status(500).json({ message: "Failed to toggle sticker" });
    }
};
exports.toggle = toggle;
/* ===============================
   MOVE TO CATEGORY
================================ */
const moveToCategory = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const { categoryId } = req.body;
        if (!categoryId) {
            return res.status(400).json({
                message: "categoryId is required",
            });
        }
        const data = await StickerService.moveToCategory(id, categoryId);
        res.json(data);
    }
    catch (error) {
        console.error("Move sticker error:", error);
        res.status(500).json({ message: "Failed to move sticker" });
    }
};
exports.moveToCategory = moveToCategory;
/* ===============================
   DELETE STICKER
================================ */
const remove = async (req, res) => {
    try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        await StickerService.remove(id);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Delete sticker error:", error);
        res.status(500).json({ message: "Failed to delete sticker" });
    }
};
exports.remove = remove;
