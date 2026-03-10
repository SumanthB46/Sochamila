import { Router } from "express";
import {
  registerUser,
  loginUser,
  checkEmailExists,
} from "./auth.controller";
import {
  loginRateLimiter,
  registerRateLimiter,
  authRateLimiter,
} from "../../middlewares/rateLimit.middleware";

const router = Router();

/* =====================================================
   AUTH ROUTES
===================================================== */

/**
 * POST /api/auth/register
 * Public
 */
router.post("/register", registerRateLimiter, registerUser);

/**
 * POST /api/auth/login
 * Public (Admin + Customer + Vendor)
 */
router.post("/login", loginRateLimiter, authRateLimiter, loginUser);

/**
 * POST /api/auth/check-email
 * Public
 * Used for AJAX validation during registration
 */
router.post("/check-email", authRateLimiter, checkEmailExists);

export default router;
