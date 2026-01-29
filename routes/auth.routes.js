const express = require("express")
const path = require("../path")
const registerUser = require("../controllers/auth/register.controller")
const loginUser = require("../controllers/auth/login.controller")
const logoutUser = require("../controllers/auth/logout.controller")
const resetPassword = require("../controllers/auth/resetPassword.controller")
const sendOtp = require("../controllers/auth/sendOtp.controller")
const otpVerificationHandler = require("../controllers/auth/verifyOtp.controller")
const router = express.Router()
const geoIpMiddleware = require(path.middleware.geoIp)
const refreshTokenRotation = require("../controllers/auth/token.controller")
const { passwordLimiter, otpLimiter } = require(path.utils.rateLimiter)


router.post("/register", geoIpMiddleware, registerUser)
router.post("/login", passwordLimiter, geoIpMiddleware, loginUser)
router.post("/logout", logoutUser)
router.post("/send-otp", otpLimiter, sendOtp)
router.post("/verify-otp", otpLimiter, otpVerificationHandler)
router.patch("/reset-password", otpLimiter, resetPassword)
router.post("/refresh-token", geoIpMiddleware, refreshTokenRotation)

module.exports = router
