"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            console.log("[AUTH] No Bearer token found in headers");
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Unauthorized - No token provided"
            });
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("[AUTH] Token decoded:", {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email,
        });
        // ✅ validate role safely
        if (!Object.values(client_1.Role).includes(decoded.role)) {
            console.log("[AUTH] Invalid role in token:", decoded.role);
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Invalid role in token"
            });
        }
        req.user = {
            id: decoded.id,
            role: decoded.role, // ✅ FIX
            email: decoded.email,
        };
        console.log("[AUTH] User authenticated:", req.user);
        next();
    }
    catch (error) {
        console.error("[AUTH] Authentication error:", error.message);
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: "Invalid or expired token",
            error: error.message
        });
    }
};
exports.authMiddleware = authMiddleware;
