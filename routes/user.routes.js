const express = require("express")
const router = express.Router()
const path = require("../path")
const authMiddleware = require(path.middleware.auth)
const fetchUserDetails = require("../controllers/user/userInfo/userDetails")

// User info
router.get("/info", authMiddleware, fetchUserDetails)

module.exports = router
