const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const fetchUserDetails = require("../controllers/user/userInfo/userDetails")


router.get("/info",authMiddleware,fetchUserDetails)

module.exports = router
