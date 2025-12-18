const express = require("express")
const registerUser = require("../controllers/auth/register")
const loginUser = require("../controllers/auth/login")
const logoutUser = require("../controllers/auth/logout")
const resetPassword = require("../controllers/auth/resetPassword")
const sendOtp = require("../controllers/auth/sendOtp")
const otpVerificationHandler = require("../controllers/auth/verifyOtp")
const router = express.Router()
const geoIpMiddleware = require("../middleware/geoIpMiddleware")
const refreshTokenRotation = require("../controllers/auth/token")
const authMiddleware = require("../middleware/authMiddleware")
const {passwordLimiter,otpLimiter} = require("../utils/rateLimiter")


router.post("/register",geoIpMiddleware,registerUser)
router.post("/login",passwordLimiter,geoIpMiddleware,loginUser)
router.post("/logout",logoutUser)
router.post("/send-otp",otpLimiter,sendOtp)
router.post("/verify-otp",otpLimiter,otpVerificationHandler)
router.post("/reset-password",otpLimiter,resetPassword)
router.post("/refresh-token",geoIpMiddleware,authMiddleware,refreshTokenRotation)

module.exports = router
