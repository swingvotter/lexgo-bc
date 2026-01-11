const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");
const { getQuizForStudent, submitQuiz } = require("../controllers/user/lecturerQuizzes/lecturerQuizController");

// Get quiz details (questions etc.)
router.get("/:quizId", authMiddleware, apiLimiter, getQuizForStudent);

// Submit quiz answers
router.post("/:quizId/submit", authMiddleware, apiLimiter, submitQuiz);

module.exports = router;
