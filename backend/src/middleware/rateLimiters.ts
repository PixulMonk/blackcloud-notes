import rateLimit from "express-rate-limit";

// authLimiter    → login, signup, getLoginMetadata, verify-email, reset-password
// resendLimiter  → forgot-password, resend-verification (DB cooldown is primary gate)
// contactLimiter → support/submit
// apiLimiter     → global default, applied once in app.ts as a catch-all floor

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many attempts. Try again later." },
});

export const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // loose — the cooldown logic is the real gate here
  message: { success: false, message: "Too many requests. Try again later." },
});

export const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: "Too many requests. Try again later." },
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// TODO: consider adding a more strict limiter for note creation, editing, and deletion endpoints. This would help prevent abuse of the note management features and ensure fair usage among users.
