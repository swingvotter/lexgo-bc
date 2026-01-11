const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const lecturerMiddleware = require("../middleware/lecturerMiddleware");
const upload = require("../middleware/multerMiddleware");
const { apiLimiter } = require("../utils/rateLimiter");
const createManualQuiz = require("../controllers/lecturer/quizes/createManualQuiz");
const createAutoQuiz = require("../controllers/lecturer/quizes/createAutoQuiz");
const getCourseQuizzes = require("../controllers/lecturer/quizes/getCourseQuizzes");
const getLecturerQuizzes = require("../controllers/lecturer/quizes/getLecturerQuizzes");
const deleteQuiz = require("../controllers/lecturer/quizes/deleteQuiz");

// Create Quiz - Manual
router.post(
    "/create/manual",
    authMiddleware,
    apiLimiter,
    upload.none(),
    createManualQuiz
);

// Create Quiz - Automatic (Document)
router.post(
    "/create/auto",
    authMiddleware,
    apiLimiter,
    upload.single("file"),
    createAutoQuiz
);

// Get all quizzes for a particular course
router.get(
    "/course/:courseId",
    authMiddleware,
    apiLimiter,
    getCourseQuizzes
);

// Get all quizzes created by a lecturer (paginated)
router.get(
    "/my-quizzes",
    authMiddleware,
    apiLimiter,
    getLecturerQuizzes
);

// Delete a quiz
router.delete(
    "/:quizId",
    authMiddleware,
    apiLimiter,
    deleteQuiz
);


module.exports = router;
