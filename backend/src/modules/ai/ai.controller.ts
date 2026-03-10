import { Request, Response } from "express";
import {
  smartCrop,
  removeBackground,
  upscale,
  enhance,
  enhanceAndUpscale,
} from "./ai.service";

/* ======================================================
   AI CONTROLLER
====================================================== */

export async function transformImage(req: Request, res: Response) {
  try {
    const { src, action } = req.body as {
      src?: string;
      action?: string;
    };

    if (!src || !action) {
      return res.status(400).json({
        success: false,
        message: "src and action are required",
      });
    }

    let result: string;

    switch (action) {
      case "smart-crop":
        result = smartCrop(src);
        break;

      case "remove-bg":
        result = removeBackground(src);
        break;

      case "upscale":
        result = upscale(src);
        break;

      case "enhance":
        result = enhance(src);
        break;

      case "enhance-upscale":
        result = enhanceAndUpscale(src);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid AI action",
        });
    }

    return res.json({
      success: true,
      src: result,
    });
  } catch (error) {
    console.error("AI Controller Error:", error);

    return res.status(500).json({
      success: false,
      message: "AI processing failed",
    });
  }
}
