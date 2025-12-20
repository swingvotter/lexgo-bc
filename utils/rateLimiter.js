const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many login attempts. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: "Too many otp request attempts. Try again in 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

const AiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each user to 20 requests per window
  message: "Too many AI requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  passwordLimiter,
  otpLimiter,
  AiLimiter
};
