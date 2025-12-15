const express = require("express")
const registerUser = require("../controllers/auth/register")
const loginUser = require("../controllers/auth/login")
const router = express.Router()
const geoIpMiddleware = require("../middleware/geoIpMiddleware")

router.post("/register",geoIpMiddleware,registerUser)
router.post("/login",loginUser)

module.exports = router