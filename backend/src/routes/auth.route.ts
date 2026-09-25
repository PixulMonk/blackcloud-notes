import express from "express";
import {
  signup,
  login,
  getLoginMetadata,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkAuth,
  resendVerificationEmail,
} from "../controllers/auth.controller";

import { ResetPasswordParams } from "../types/auth.types";

import { protectRoute } from "../middleware/auth.middleware";
import { authLimiter, resendLimiter } from "../middleware/rateLimiters";

const router = express.Router();

router.get("/check-auth", protectRoute, checkAuth);
router.post("/getLoginMetadata", authLimiter, getLoginMetadata);
router.post("/signup", authLimiter, signup);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/verify-email", authLimiter, verifyEmail);
router.post("/forgot-password", resendLimiter, forgotPassword);
router.post<ResetPasswordParams>(
  "/reset-password/:token",
  authLimiter,
  resetPassword,
);
router.post("/resend-verification", resendLimiter, resendVerificationEmail);

export default router;
