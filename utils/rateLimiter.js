const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later."
    });
  }
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again in 15 minutes."
    });
  }
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many otp request attempts. Try again in 15 minutes."
    });
  }
});

const AiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day 
  max: 20, // Limit each user to 20 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many AI requests. Please try again later."
    });
  }
});

module.exports = {
  apiLimiter,
  passwordLimiter,
  otpLimiter,
  AiLimiter
};
