"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformImage = transformImage;
const ai_service_1 = require("./ai.service");
/* ======================================================
   AI CONTROLLER
====================================================== */
async function transformImage(req, res) {
    try {
        const { src, action } = req.body;
        if (!src || !action) {
            return res.status(400).json({
                success: false,
                message: "src and action are required",
            });
        }
        let result;
        switch (action) {
            case "smart-crop":
                result = (0, ai_service_1.smartCrop)(src);
                break;
            case "remove-bg":
                result = (0, ai_service_1.removeBackground)(src);
                break;
            case "upscale":
                result = (0, ai_service_1.upscale)(src);
                break;
            case "enhance":
                result = (0, ai_service_1.enhance)(src);
                break;
            case "enhance-upscale":
                result = (0, ai_service_1.enhanceAndUpscale)(src);
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
    }
    catch (error) {
        console.error("AI Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "AI processing failed",
        });
    }
}
