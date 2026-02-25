const express = require("express");
const router = express.Router();
const path = require('../../path');
const createCourseHandler = require("../../controllers/v1/lecturer/courses/createCourse")
const upload = require(path.middleware.multer)

const authMiddleware = require(path.middleware.auth);
const lecturerMiddleware = require(path.middleware.lecturer);
const { apiLimiter } = require(path.utils.rateLimiter);
const uploadResourceHandler = require("../../controllers/v1/lecturer/courses/uploadResource");
const createCourseMaterialHandler = require("../../controllers/v1/lecturer/courses/createCourseMaterial");
const getAllResourceContentHandler = require("../../controllers/v1/lecturer/courses/getAllContents");
const getCourseMaterialsHandler = require("../../controllers/v1/lecturer/courses/getCourseMaterials");
const getCourseMaterialStatusHandler = require("../../controllers/v1/lecturer/courses/courseMaterialStatus");
const deleteCourseHandler = require("../../controllers/v1/lecturer/courses/deleteCourse");
const getCourseResourcesHandler = require("../../controllers/v1/lecturer/courses/getCourseResources");
const downloadResourceHandler = require("../../controllers/v1/lecturer/courses/downloadResource");

// Get all cases
router.get("/resource/download/:resourceId", authMiddleware, lecturerMiddleware, apiLimiter, downloadResourceHandler);
router.get("/courseMaterial/status/:jobId", authMiddleware, lecturerMiddleware, apiLimiter, getCourseMaterialStatusHandler);

router.get("/resourceContents/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getAllResourceContentHandler);
router.get("/courseMaterials/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getCourseMaterialsHandler);
router.get("/resources/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getCourseResourcesHandler);
router.post("/", authMiddleware, lecturerMiddleware, upload.single("courseImage"), apiLimiter, createCourseHandler);
router.post("/resource/:courseId", authMiddleware, lecturerMiddleware, upload.single("resourceFile"), apiLimiter, uploadResourceHandler);
router.post("/courseMaterial/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, createCourseMaterialHandler);
router.delete("/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, deleteCourseHandler);

module.exports = router;

