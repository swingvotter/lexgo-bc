const express = require("express");
const router = express.Router();
const upload = require("../middleware/multerMiddleware");
const authMiddleware = require("../middleware/authMiddleware");
const lecturerMiddleware = require("../middleware/lecturerMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");

const createCase = require("../controllers/lecturer/cases/createCase");
const deleteCase = require("../controllers/lecturer/cases/deleteCase");
const getCases = require("../controllers/lecturer/cases/getCases");

const getAllLecturerCases = require("../controllers/lecturer/cases/getAllLecturerCases");

// Get all cases by lecturer
router.get("/", authMiddleware, lecturerMiddleware, apiLimiter, getAllLecturerCases);

// Get all cases with pagination and filtering for a specific course
router.get("/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getCases);

// Create a new case for a specific course
router.post("/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, upload.single("caseDocument"), createCase);

// Delete a case by ID
router.delete("/:id", authMiddleware, lecturerMiddleware, apiLimiter, deleteCase);

module.exports = router;

