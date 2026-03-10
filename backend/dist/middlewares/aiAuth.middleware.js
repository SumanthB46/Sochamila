"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiAuth = aiAuth;
function aiAuth(req, res, next) {
    const key = req.headers["x-ai-key"];
    if (!key || key !== process.env.AI_SECRET_KEY) {
        return res.status(401).json({ message: "Invalid AI key" });
    }
    next();
}
