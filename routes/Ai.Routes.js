const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const askAiHandler = require("../controllers/user/ai/askAi")
const getAiHistoryHandler = require("../controllers/user/ai/getAiHistory")
const generateQuizHandler = require("../controllers/user/ai/quizGenerator")
const getQuizStatusHandler = require("../controllers/user/ai/quizStatus")
const {AiLimiter} = require("../utils/rateLimiter")

router.post("/ask",authMiddleware,AiLimiter,askAiHandler)
router.get("/history",authMiddleware,AiLimiter,getAiHistoryHandler)
router.post("/quiz", authMiddleware, generateQuizHandler);
router.get("/quiz/status/:jobId", authMiddleware, getQuizStatusHandler);

module.exports = router
