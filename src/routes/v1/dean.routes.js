const express = require("express");
const router = express.Router();
const path = require('../../path');
const authMiddleware = require(path.middleware.auth);
const deanMiddleware = require(path.middleware.dean);
const { apiLimiter } = require(path.utils.rateLimiter);

const fetchCourses = require("../../controllers/v1/admin/dean/courses/fetchCourses");
const fetchEnrollments = require("../../controllers/v1/admin/dean/enrollments/fetchEnrollments");
const fetchLecturers = require("../../controllers/v1/admin/dean/lecturers/fetchLecturers");
const getAllBatches = require("../../controllers/v1/admin/dean/batches/getAllBatches");
const getBatch = require("../../controllers/v1/admin/dean/batches/getBatch");

router.get("/courses", authMiddleware, deanMiddleware, apiLimiter, fetchCourses);
router.get("/enrollments", authMiddleware, deanMiddleware, apiLimiter, fetchEnrollments);
router.get("/lecturers", authMiddleware, deanMiddleware, apiLimiter, fetchLecturers);
router.get("/batches", authMiddleware, deanMiddleware, apiLimiter, getAllBatches);
router.get("/batches/:id", authMiddleware, deanMiddleware, apiLimiter, getBatch);

module.exports = router;
