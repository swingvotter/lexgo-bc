const express = require("express");
const router = express.Router();
const createCourseHandler = require("../controllers/lecturer/createCourse")
const upload = require("../middleware/multerMiddleware")

const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");
const uploadResourceHandler = require("../controllers/lecturer/uploadResource");
const createCourseMaterialHandler = require("../controllers/lecturer/createCourseMaterial");
const getAllResourceContentHandler = require("../controllers/lecturer/getAllContents");

// Get all cases
router.post("/", authMiddleware,upload.single("courseImage"),apiLimiter,createCourseHandler);
router.get("/resourceContents/:courseId",apiLimiter,getAllResourceContentHandler);
router.post("/courseMaterial/:courseId",apiLimiter,createCourseMaterialHandler);
router.post("/resource/:courseId", authMiddleware,upload.single("resourceFile"),apiLimiter,uploadResourceHandler);

module.exports = router;
