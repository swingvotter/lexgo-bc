const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");

const getCaseDetails = require("../controllers/user/cases/getCaseContent");
const submitCaseQuiz = require("../controllers/user/cases/submitCaseQuiz");
const viewCaseDocument = require("../controllers/user/cases/viewCaseDocument");

// Get single case with its quiz (for students)
router.get("/:caseId", authMiddleware, apiLimiter, getCaseDetails);

// View case document (proxy stream)
router.get("/:caseId/view-document", authMiddleware, apiLimiter, viewCaseDocument);

// Submit answers for a case quiz
router.post("/:caseId/submit", authMiddleware, apiLimiter, submitCaseQuiz);

module.exports = router;
