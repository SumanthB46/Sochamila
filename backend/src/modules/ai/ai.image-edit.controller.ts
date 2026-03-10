import { Request, Response } from "express";
import { editImage, type ImageEditAction } from "./ai.image-edit.service";

/**
 * POST /api/ai/image-edit
 * Edit an image: remove background or upscale
 * Body: { imageUrl: string, action: "remove-bg" | "upscale" }
 * Returns: { success, url, action } — new image URL to use on the layer
 */
export async function imageEdit(req: Request, res: Response) {
  try {
    const { imageUrl, action } = req.body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({
        success: false,
        error: "imageUrl is required",
      });
    }

    const validActions: ImageEditAction[] = ["remove-bg", "upscale"];
    if (!action || !validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: "action must be one of: remove-bg, upscale",
      });
    }

    const result = await editImage(imageUrl.trim(), action);
    return res.json(result);
  } catch (error: any) {
    console.error("[AI Image Edit Error]", error);

    const status = error?.status ?? error?.statusCode ?? error?.response?.status;
    if (status === 402) {
      return res.status(402).json({
        success: false,
        error:
          "Insufficient Replicate credit. Add billing at https://replicate.com/account/billing to use remove background and upscale.",
      });
    }

    let message: string =
      error?.body?.detail ??
      error?.detail ??
      error?.message ??
      "Image edit failed. Please try again.";
    if (typeof message !== "string") message = "Image edit failed. Please try again.";
    if (message.includes("402") && message.includes("Insufficient")) {
      return res.status(402).json({
        success: false,
        error:
          "Insufficient Replicate credit. Add billing at https://replicate.com/account/billing to use remove background and upscale.",
      });
    }

    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      error: message,
    });
  }
}
