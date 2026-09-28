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
  changePassword,
} from "../controllers/auth.controller";

import { ResetPasswordParams } from "../types/auth.types";

import { protectRoute } from "../middleware/auth.middleware";
import {
  changePasswordLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  loginMetadataLimiter,
  resetPasswordLimiter,
  resendVerificationLimiter,
  signupLimiter,
  verifyEmailLimiter,
} from "../middleware/rateLimiters";

const router = express.Router();

router.get("/check-auth", protectRoute, checkAuth);
router.post("/getLoginMetadata", loginMetadataLimiter, getLoginMetadata);
router.post("/signup", signupLimiter, signup);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.post("/verify-email", verifyEmailLimiter, verifyEmail);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post<ResetPasswordParams>(
  "/reset-password/:token",
  resetPasswordLimiter,
  resetPassword,
);
router.post(
  "/change-password",
  changePasswordLimiter,
  protectRoute,
  changePassword,
);
router.post(
  "/resend-verification",
  resendVerificationLimiter,
  resendVerificationEmail,
);

export default router;
