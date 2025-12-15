const express = require("express")
const registerUser = require("../controllers/register")
const loginUser = require("../controllers/login")
const router = express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)

module.exports = router