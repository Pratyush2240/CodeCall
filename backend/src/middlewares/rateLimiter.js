import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

/* =========================
   GLOBAL LIMITER
========================= */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

/* =========================
   AUTH LIMITER
========================= */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again later."
  }
});

/* =========================
   AUTH SLOW DOWN
========================= */
export const authSlowDown = slowDown({
  windowMs: 10 * 60 * 1000,
  delayAfter: 3,
  delayMs: () => 1000
});