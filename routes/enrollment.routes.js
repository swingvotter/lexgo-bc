const express = require("express");
const router = express.Router();
const path = require("../path");

const authMiddleware = require(path.middleware.auth);
const lecturerMiddleware = require(path.middleware.lecturer);
const { apiLimiter } = require(path.utils.rateLimiter);

// Student controllers
const applyToCourseHandler = require("../controllers/enrollment/applyToCourse");
const getEnrolledCoursesHandler = require("../controllers/enrollment/getEnrolledCourses");

// Lecturer controllers
const getPendingRequestsHandler = require("../controllers/enrollment/getPendingRequests");
const approveOrRejectEnrollmentHandler = require("../controllers/enrollment/approveOrRejectEnrollment");

// =====================
// Student Routes
// =====================
// Apply to a course (creates pending enrollment)
router.post("/apply/:courseId", authMiddleware, apiLimiter, applyToCourseHandler);

// Get all enrolled (approved) courses for the student
router.get("/my-courses", authMiddleware, apiLimiter, getEnrolledCoursesHandler);

// =====================
// Lecturer Routes
// =====================
// Get pending enrollment requests for a specific course
router.get("/requests/:courseId/pending", authMiddleware, lecturerMiddleware, apiLimiter, getPendingRequestsHandler);

// Approve or reject a student's enrollment request
// Body: { action: "approve" | "reject" }
router.patch("/requests/:courseId/:userId", authMiddleware, lecturerMiddleware, apiLimiter, approveOrRejectEnrollmentHandler);

module.exports = router;

