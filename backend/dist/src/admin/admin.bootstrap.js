"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapAdmin = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../config/prisma");
const bootstrapAdmin = async () => {
    const adminExists = await prisma_1.prisma.user.findFirst({
        where: { role: "ADMIN" },
    });
    if (adminExists)
        return;
    const hash = await bcrypt_1.default.hash(process.env.ADMIN_PASSWORD, 10);
    await prisma_1.prisma.user.create({
        data: {
            name: "Super Admin",
            email: process.env.ADMIN_EMAIL,
            password: hash,
            role: "ADMIN",
            isActive: true,
        },
    });
    console.log("✅ Admin account created");
};
exports.bootstrapAdmin = bootstrapAdmin;
