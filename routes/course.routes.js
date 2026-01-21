const express = require("express");
const router = express.Router();
const createCourseHandler = require("../controllers/lecturer/courses/createCourse")
const upload = require("../middleware/multerMiddleware")

const authMiddleware = require("../middleware/authMiddleware");
const lecturerMiddleware = require("../middleware/lecturerMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");
const uploadResourceHandler = require("../controllers/lecturer/courses/uploadResource");
const createCourseMaterialHandler = require("../controllers/lecturer/courses/createCourseMaterial");
const getAllResourceContentHandler = require("../controllers/lecturer/courses/getAllContents");
const getCourseMaterialsHandler = require("../controllers/lecturer/courses/getCourseMaterials");
const getCourseMaterialStatusHandler = require("../controllers/lecturer/courses/courseMaterialStatus");
const deleteCourseHandler = require("../controllers/lecturer/courses/deleteCourse");
const getCourseResourcesHandler = require("../controllers/lecturer/courses/getCourseResources");
const downloadResourceHandler = require("../controllers/lecturer/courses/downloadResource");

// Get all cases
router.get("/resource/download/:resourceId", authMiddleware, apiLimiter, downloadResourceHandler);
router.get("/courseMaterial/status/:jobId", authMiddleware, lecturerMiddleware, apiLimiter, getCourseMaterialStatusHandler);

router.get("/resourceContents/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getAllResourceContentHandler);
router.get("/courseMaterials/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getCourseMaterialsHandler);
router.get("/resources/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, getCourseResourcesHandler);
router.post("/", authMiddleware, lecturerMiddleware, upload.single("courseImage"), apiLimiter, createCourseHandler);
router.post("/resource/:courseId", authMiddleware, lecturerMiddleware, upload.single("resourceFile"), apiLimiter, uploadResourceHandler);
router.post("/courseMaterial/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, createCourseMaterialHandler);
router.delete("/:courseId", authMiddleware, lecturerMiddleware, apiLimiter, deleteCourseHandler);

module.exports = router;

