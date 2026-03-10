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
    // 1️⃣ Find user
    const user = await prisma_1.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
    });
    if (!user || !user.isActive) {
        throw new Error("Invalid email or password");
    }
    // 2️⃣ Compare password
    const isPasswordValid = await (0, hash_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }
    // 3️⃣ Generate token
    const token = (0, jwt_1.signToken)({
        id: user.id,
        role: user.role,
    });
    return { token, user };
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
