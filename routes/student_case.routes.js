const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");

const getCaseDetails = require("../controllers/user/cases/getCaseContent");
const submitCaseQuiz = require("../controllers/user/cases/submitCaseQuiz");

// Get single case with its quiz (for students)
router.get("/:caseId", authMiddleware, apiLimiter, getCaseDetails);

// Submit answers for a case quiz
router.post("/:caseId/submit", authMiddleware, apiLimiter, submitCaseQuiz);

module.exports = router;
