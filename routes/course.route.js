const express = require("express");
const router = express.Router();
const createCourseHandler = require("../controllers/lecturer/createCourse")
const upload = require("../middleware/multerMiddleware")

const authMiddleware = require("../middleware/authMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");
const uploadResourceHandler = require("../controllers/lecturer/uploadResource");

// Get all cases
router.post("/", authMiddleware,upload.single("courseImage"),apiLimiter,createCourseHandler);
router.post("/resource", authMiddleware,upload.single("resourceFile"),apiLimiter,uploadResourceHandler);

module.exports = router;
