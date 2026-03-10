"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword = async (password) => {
    try {
        return await bcryptjs_1.default.hash(password, 10);
    }
    catch (error) {
        console.error("Hash error:", error);
        throw error;
    }
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hash) => {
    try {
        console.log("Comparing password. Hash exists:", !!hash, "Password length:", password.length);
        const result = await bcryptjs_1.default.compare(password, hash);
        console.log("Password comparison result:", result);
        return result;
    }
    catch (error) {
        console.error("Compare password error:", error);
        throw error;
    }
};
exports.comparePassword = comparePassword;
