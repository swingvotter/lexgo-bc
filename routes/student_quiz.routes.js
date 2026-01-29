const express = require("express");
const router = express.Router();
const path = require("../path");
const authMiddleware = require(path.middleware.auth);
const { apiLimiter } = require(path.utils.rateLimiter);
const { getQuizForStudent, submitQuiz } = require("../controllers/user/lecturerQuizzes/lecturerQuizController");
const getQuizStatus = require("../controllers/user/lecturerQuizzes/getQuizStatus");

// Get quiz details (questions etc.)
router.get("/:quizId", authMiddleware, apiLimiter, getQuizForStudent);

// Submit quiz answers
router.post("/:quizId/submit", authMiddleware, apiLimiter, submitQuiz);

// Get quiz status (attempts, score, availability)
router.get("/:quizId/status", authMiddleware, apiLimiter, getQuizStatus);

module.exports = router;
