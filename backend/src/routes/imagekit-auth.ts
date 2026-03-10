import { Router, Request, Response } from "express";
import { imagekit } from "../lib/imagekit";

const router = Router();

/**
 * GET /api/imagekit-auth
 * @description Get ImageKit authentication parameters for client-side uploads
 * @returns {Object} Authentication parameters for ImageKit
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const auth = imagekit.getAuthenticationParameters();
    
    return res.status(200).json({
      success: true,
      auth,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    console.error("ImageKit auth error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get authentication parameters",
    });
  }
});

export default router;
