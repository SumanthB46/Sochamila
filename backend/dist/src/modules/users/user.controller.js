"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = updateUser;
exports.getUser = getUser;
const prisma_1 = __importDefault(require("../../lib/prisma"));
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email } = req.body;
        if (!id)
            return res.status(400).json({ error: "Missing user id" });
        const data = {};
        if (typeof name === "string")
            data.name = name;
        if (typeof email === "string")
            data.email = email;
        if (Object.keys(data).length === 0) {
            return res.status(400).json({ error: "No fields to update" });
        }
        const user = await prisma_1.default.user.update({
            where: { id: typeof id === 'string' ? id : '' },
            data,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return res.json({ success: true, user });
    }
    catch (error) {
        console.error("UPDATE USER ERROR:", error);
        if (error.code === "P2025") {
            return res.status(404).json({ error: "User not found" });
        }
        return res.status(500).json({ error: "Failed to update user" });
    }
}
async function getUser(req, res) {
    try {
        const { id } = req.params;
        if (!id)
            return res.status(400).json({ error: "Missing user id" });
        const user = await prisma_1.default.user.findUnique({
            where: { id: typeof id === 'string' ? id : '' },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        return res.json({ success: true, user });
    }
    catch (error) {
        console.error("GET USER ERROR:", error);
        return res.status(500).json({ error: "Failed to fetch user" });
    }
}
