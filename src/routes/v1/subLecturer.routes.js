const express = require("express");
const router = express.Router();
const path = require('../../path');

const authMiddleware = require(path.middleware.auth);
const lecturerMiddleware = require(path.middleware.lecturer);
const { apiLimiter } = require(path.utils.rateLimiter);

const requestSubLecturer = require("../../controllers/v1/lecturer/subLecturer/requestSubLecturer");
const handleSubLecturerRequest = require("../../controllers/v1/lecturer/subLecturer/handleSubLecturerRequest");
const getPendingSubLecturers = require("../../controllers/v1/lecturer/subLecturer/getPendingSubLecturers");
const getSubLecturers = require("../../controllers/v1/lecturer/subLecturer/getSubLecturers");
const removeSubLecturer = require("../../controllers/v1/lecturer/subLecturer/removeSubLecturer");

// Request to become a sub-lecturer for a course
router.post("/request/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, requestSubLecturer);

// Get pending sub-lecturer requests (course owner only)
router.get("/requests/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getPendingSubLecturers);

// Approve or reject a sub-lecturer request (course owner only)
router.patch("/request/:courseId/:lecturerId", authMiddleware, lecturerMiddleware, apiLimiter, handleSubLecturerRequest);

// Get approved sub-lecturers for a course (course owner only)
router.get("/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getSubLecturers);

// Remove a sub-lecturer (course owner only)
router.delete("/:courseId/:lecturerId", authMiddleware, lecturerMiddleware, apiLimiter, removeSubLecturer);

module.exports = router;
