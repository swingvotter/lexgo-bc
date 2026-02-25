const express = require("express");
const router = express.Router();
const path = require('../../path');
const authMiddleware = require(path.middleware.auth);
const lecturerMiddleware = require(path.middleware.lecturer);
const upload = require(path.middleware.multer);
const { apiLimiter } = require(path.utils.rateLimiter);
const createManualQuiz = require("../../controllers/v1/lecturer/quizes/createManualQuiz");
const createAutoQuiz = require("../../controllers/v1/lecturer/quizes/createAutoQuiz");
const getCourseQuizzes = require("../../controllers/v1/lecturer/quizes/getCourseQuizzes");
const getLecturerQuizzes = require("../../controllers/v1/lecturer/quizes/getLecturerQuizzes");
const deleteQuiz = require("../../controllers/v1/lecturer/quizes/deleteQuiz");

// Create Quiz - Manual
router.post(
    "/create/manual",
    authMiddleware,
    lecturerMiddleware,
    apiLimiter,
    upload.none(),
    createManualQuiz
);

// Create Quiz - Automatic (Document)
router.post(
    "/create/auto",
    authMiddleware,
    lecturerMiddleware,
    apiLimiter,
    upload.single("file"),
    createAutoQuiz
);

// Get all quizzes for a particular course
router.get(
    "/course/:courseId",
    authMiddleware,
    lecturerMiddleware,
    apiLimiter,
    getCourseQuizzes

);

// Get all quizzes created by a lecturer (paginated)
router.get(
    "/my-quizzes",
    authMiddleware,
    lecturerMiddleware,
    apiLimiter,
    getLecturerQuizzes
);

// Delete a quiz
router.delete(
    "/:quizId",
    authMiddleware,
    lecturerMiddleware,
    apiLimiter,
    deleteQuiz
);



module.exports = router;
