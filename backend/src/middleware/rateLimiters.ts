import rateLimit from "express-rate-limit";

// Each auth endpoint has its own bucket so one action does not consume another's allowance.
// apiLimiter remains a broad per-IP floor across API routes.

const createAuthLimiter = (max: number, skipSuccessfulRequests = false) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    skipSuccessfulRequests,
    message: { success: false, message: "Too many attempts. Try again later." },
  });

export const loginMetadataLimiter = createAuthLimiter(30);
export const signupLimiter = createAuthLimiter(5);
export const loginLimiter = createAuthLimiter(10, true);
export const verifyEmailLimiter = createAuthLimiter(10);
export const resetPasswordLimiter = createAuthLimiter(10);
export const changePasswordLimiter = createAuthLimiter(10);

export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // loose — the cooldown logic is the real gate here
  message: { success: false, message: "Too many requests. Try again later." },
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { success: false, message: "Too many requests. Try again later." },
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many requests. Try again later." },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 300 : 10000,
});
