"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAdmin = initAdmin;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function initAdmin() {
    try {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
            console.log("⚠️ ADMIN env not set — skipping admin init");
            return;
        }
        const exists = await prisma.user.findUnique({
            where: { email },
        });
        if (exists) {
            console.log("✅ Admin already exists");
            return;
        }
        const hash = await bcryptjs_1.default.hash(password, 10);
        await prisma.user.create({
            data: {
                name: "Super Admin",
                email,
                password: hash,
                role: client_1.Role.ADMIN,
                isActive: true,
            },
        });
        console.log("✅ Admin created successfully");
    }
    catch (err) {
        console.error("❌ initAdmin error:", err);
    }
}
