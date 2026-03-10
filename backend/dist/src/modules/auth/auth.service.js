"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUserService = registerUserService;
exports.loginUserService = loginUserService;
exports.checkEmailExistsService = checkEmailExistsService;
const prisma_1 = require("../../config/prisma");
const hash_1 = require("../../utils/hash");
const jwt_1 = require("../../utils/jwt");
/* =====================================================
   REGISTER USER
===================================================== */
async function registerUserService(data) {
    // 1️⃣ Check existing email
    const existingUser = await prisma_1.prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new Error("Email already registered");
    }
    // 2️⃣ Hash password
    const hashedPassword = await (0, hash_1.hashPassword)(data.password);
    // 3️⃣ Create user
    const user = await prisma_1.prisma.user.create({
        data: {
            name: data.name.trim(),
            email: data.email.toLowerCase(),
            password: hashedPassword,
            role: "CUSTOMER",
            isActive: true,
        },
    });
    // 4️⃣ Generate JWT
    const token = (0, jwt_1.signToken)({
        id: user.id,
        role: user.role,
    });
    return { token, user };
}
/* =====================================================
   LOGIN USER
===================================================== */
async function loginUserService(email, password) {
    try {
        // 1️⃣ Find user
        console.log("[AUTH] Attempting login for email:", email);
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        console.log("[AUTH] User found:", !!user);
        console.log("[AUTH] User data:", user ? { id: user.id, email: user.email, isActive: user.isActive, role: user.role } : null);
        if (!user) {
            console.log("[AUTH] User not found in database");
            throw new Error("Invalid email or password");
        }
        if (!user.isActive) {
            console.log("[AUTH] User account is inactive");
            throw new Error("Invalid email or password");
        }
        // 2️⃣ Compare password
        console.log("[AUTH] Checking password...");
        const isPasswordValid = await (0, hash_1.comparePassword)(password, user.password);
        console.log("[AUTH] Password valid:", isPasswordValid);
        if (!isPasswordValid) {
            console.log("[AUTH] Password mismatch");
            throw new Error("Invalid email or password");
        }
        // 3️⃣ Generate token
        console.log("[AUTH] Generating JWT token...");
        const token = (0, jwt_1.signToken)({
            id: user.id,
            role: user.role,
        });
        console.log("[AUTH] Login successful for:", email);
        return { token, user };
    }
    catch (error) {
        console.error("[AUTH] Login error:", error.message);
        throw error;
    }
}
/* =====================================================
   CHECK EMAIL EXISTS (AJAX SUPPORT)
===================================================== */
async function checkEmailExistsService(email) {
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    return !!user;
}
