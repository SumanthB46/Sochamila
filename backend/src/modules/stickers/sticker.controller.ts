import { Request, Response } from "express";
import * as StickerService from "./sticker.service";

/* ===============================
   GET ALL STICKERS
================================ */
export const getAll = async (_req: Request, res: Response) => {
  try {
    const data = await StickerService.getAll();
    res.json(data);
  } catch (error) {
    console.error("Get stickers error:", error);
    res.status(500).json({ message: "Failed to get stickers" });
  }
};

/* ===============================
   UPLOAD STICKERS
================================ */
export const upload = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
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
  } catch (error) {
    console.error("Upload stickers error:", error);
    res.status(500).json({ message: "Failed to upload stickers" });
  }
};

/* ===============================
   TOGGLE ENABLE / DISABLE
================================ */
export const toggle = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const data = await StickerService.toggle(id);
    res.json(data);
  } catch (error) {
    console.error("Toggle sticker error:", error);
    res.status(500).json({ message: "Failed to toggle sticker" });
  }
};

/* ===============================
   MOVE TO CATEGORY
================================ */
export const moveToCategory = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Move sticker error:", error);
    res.status(500).json({ message: "Failed to move sticker" });
  }
};

/* ===============================
   DELETE STICKER
================================ */
export const remove = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await StickerService.remove(id);
    res.json({ success: true });
  } catch (error) {
    console.error("Delete sticker error:", error);
    res.status(500).json({ message: "Failed to delete sticker" });
  }
};
