const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const askAiHandler = require("../controllers/user/ai/askAi")
const {AiLimiter} = require("../utils/rateLimiter")

router.post("/ask-AI",authMiddleware,AiLimiter,askAiHandler)


module.exports = router
