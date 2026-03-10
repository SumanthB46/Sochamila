"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEmailExists = exports.loginUser = exports.registerUser = void 0;
const auth_service_1 = require("./auth.service");
/* =====================================================
   REGISTER USER
===================================================== */
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }
        const { token, user } = await (0, auth_service_1.registerUserService)({
            name,
            email,
            password,
        });
        return res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(400).json({
            message: error.message || "Registration failed",
        });
    }
};
exports.registerUser = registerUser;
/* =====================================================
   LOGIN USER (ADMIN / CUSTOMER / VENDOR)
===================================================== */
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }
        const { token, user } = await (0, auth_service_1.loginUserService)(email, password);
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(401).json({
            message: error.message || "Invalid credentials",
        });
    }
};
exports.loginUser = loginUser;
/* =====================================================
   CHECK EMAIL EXISTS (AJAX)
   Used during registration
===================================================== */
const checkEmailExists = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                message: "Email is required",
            });
        }
        const exists = await (0, auth_service_1.checkEmailExistsService)(email);
        return res.status(200).json({
            exists,
        });
    }
    catch (error) {
        console.error("CHECK EMAIL ERROR:", error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
exports.checkEmailExists = checkEmailExists;
