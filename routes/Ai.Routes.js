const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const askAiHandler = require("../controllers/user/ai/askAi")
const getAiHistoryHandler = require("../controllers/user/ai/getAiHistory")
const generateQuizHandler = require("../controllers/user/ai/quizGenerator")
const {AiLimiter} = require("../utils/rateLimiter")

router.post("/ask",authMiddleware,AiLimiter,askAiHandler)
router.get("/history",authMiddleware,AiLimiter,getAiHistoryHandler)
router.post("/quiz", authMiddleware, generateQuizHandler);

module.exports = router
