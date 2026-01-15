const express = require("express");
const router = express.Router();
const createCourseHandler = require("../controllers/lecturer/courses/createCourse")
const upload = require("../middleware/multerMiddleware")

const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");
const uploadResourceHandler = require("../controllers/lecturer/courses/uploadResource");
const createCourseMaterialHandler = require("../controllers/lecturer/courses/createCourseMaterial");
const getAllResourceContentHandler = require("../controllers/lecturer/courses/getAllContents");
const getCourseMaterialsHandler = require("../controllers/lecturer/courses/getCourseMaterials");
const getCourseMaterialStatusHandler = require("../controllers/lecturer/courses/courseMaterialStatus");
const deleteCourseHandler = require("../controllers/lecturer/courses/deleteCourse");
const getCourseResourcesHandler = require("../controllers/lecturer/courses/getCourseResources");

// Get all cases
router.get("/courseMaterial/status/:jobId", authMiddleware, apiLimiter, getCourseMaterialStatusHandler);
router.get("/resourceContents/:courseId", authMiddleware, apiLimiter, getAllResourceContentHandler);
router.get("/courseMaterials/:courseId", authMiddleware, apiLimiter, getCourseMaterialsHandler);
router.get("/resources/:courseId", authMiddleware, apiLimiter, getCourseResourcesHandler);
router.post("/", authMiddleware, upload.single("courseImage"), apiLimiter, createCourseHandler);
router.post("/resource/:courseId", authMiddleware, upload.single("resourceFile"), apiLimiter, uploadResourceHandler);
router.post("/courseMaterial/:courseId", authMiddleware, apiLimiter, createCourseMaterialHandler);
router.delete("/:courseId", authMiddleware, apiLimiter, deleteCourseHandler);

module.exports = router;
