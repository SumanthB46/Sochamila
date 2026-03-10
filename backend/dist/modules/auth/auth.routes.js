"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
/* =====================================================
   AUTH ROUTES
===================================================== */
/**
 * POST /api/auth/register
 * Public
 */
router.post("/register", auth_controller_1.registerUser);
/**
 * POST /api/auth/login
 * Public (Admin + Customer + Vendor)
 */
router.post("/login", auth_controller_1.loginUser);
/**
 * POST /api/auth/check-email
 * Public
 * Used for AJAX validation during registration
 */
router.post("/check-email", auth_controller_1.checkEmailExists);
exports.default = router;
