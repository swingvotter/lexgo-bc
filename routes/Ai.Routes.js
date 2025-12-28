const express = require("express")
const router = express.Router()
const authMiddleware = require("../middleware/authMiddleware")
const askAiHandler = require("../controllers/user/ai/askAi")
const getAiHistoryHandler = require("../controllers/user/ai/getAiHistory")
const generateQuizHandler = require("../controllers/user/ai/quiz/createQuiz")
const getQuizStatusHandler = require("../controllers/user/ai/quiz/quizStatus")
const submitQuizScoresHandler = require("../controllers/user/ai/quiz/submitQuizScores")
const {AiLimiter} = require("../utils/rateLimiter")

router.post("/ask",authMiddleware,AiLimiter,askAiHandler)
router.get("/history",authMiddleware,AiLimiter,getAiHistoryHandler)
router.post("/quiz", authMiddleware, generateQuizHandler);
router.get("/quiz/status/:jobId", authMiddleware, getQuizStatusHandler);
router.post("/quiz/submit/:quizId", authMiddleware, submitQuizScoresHandler);

module.exports = router
