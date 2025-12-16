const express = require("express")
const registerUser = require("../controllers/auth/register")
const loginUser = require("../controllers/auth/login")
const logoutUser = require("../controllers/auth/logout")
const resetPassword = require("../controllers/auth/forgetPassword")
const router = express.Router()
const geoIpMiddleware = require("../middleware/geoIpMiddleware")
const refreshTokenRotation = require("../controllers/auth/token")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register",geoIpMiddleware,registerUser)
router.post("/login",geoIpMiddleware,loginUser)
router.post("/logout",logoutUser)
router.post("/forget-password",resetPassword)
router.post("/refresh-token",geoIpMiddleware,authMiddleware,refreshTokenRotation)

module.exports = router