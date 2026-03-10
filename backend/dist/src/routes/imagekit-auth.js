"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const imagekit_1 = require("../lib/imagekit");
const router = (0, express_1.Router)();
/**
 * GET /api/imagekit-auth
 * @description Get ImageKit authentication parameters for client-side uploads
 * @returns {Object} Authentication parameters for ImageKit
 */
router.get("/", (req, res) => {
    try {
        const auth = imagekit_1.imagekit.getAuthenticationParameters();
        return res.status(200).json({
            success: true,
            auth,
            publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        });
    }
    catch (error) {
        console.error("ImageKit auth error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to get authentication parameters",
        });
    }
});
exports.default = router;
