const express = require("express")
const router = express.Router()
const path = require('../../path')
const authMiddleware = require(path.middleware.auth)
const askAiHandler = require("../../controllers/v1/user/ai/askAi")
const getAiHistoryHandler = require("../../controllers/v1/user/ai/getAiHistory")
const generateQuizHandler = require("../../controllers/v1/user/ai/quiz/createQuiz")
const getQuizStatusHandler = require("../../controllers/v1/user/ai/quiz/quizStatus")
const submitQuizScoresHandler = require("../../controllers/v1/user/ai/quiz/submitQuizScores")
const getQuizHandler = require("../../controllers/v1/user/ai/quiz/getQuiz")
const getQuizzesHandler = require("../../controllers/v1/user/ai/quiz/getQuizzes")
const deleteQuizHandler = require("../../controllers/v1/user/ai/quiz/deleteQuiz")
const { AiLimiter } = require(path.utils.rateLimiter)

router.post("/ask", authMiddleware, AiLimiter, askAiHandler)
router.get("/history", authMiddleware, AiLimiter, getAiHistoryHandler)
router.post("/quiz", authMiddleware, generateQuizHandler);
router.get("/quiz/status/:jobId", authMiddleware, getQuizStatusHandler);
router.post("/quiz/submit/:quizId", authMiddleware, submitQuizScoresHandler);
router.get("/quizzes", authMiddleware, getQuizzesHandler);
router.get("/quiz/:quizId", authMiddleware, getQuizHandler);
router.delete("/quiz/:quizId", authMiddleware, deleteQuizHandler);

module.exports = router
