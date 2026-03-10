"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("[ERROR] JWT_SECRET is not defined in environment variables!");
    throw new Error("JWT_SECRET environment variable is required");
}
const signToken = (payload) => {
    console.log("[JWT] Signing token with payload:", payload);
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    console.log("[JWT] Token signed successfully");
    return token;
};
exports.signToken = signToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
