const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const Enrollment = require(path.models.users.enrollment);
const LecturerQuizSubmission = require(path.models.users.lecturerQuizSubmission);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get quiz details for a student
 * Validates enrollment, timing, and attempts.
 */
const getQuizForStudent = async (req, res) => {
    const { quizId } = req.params;
    const userId = req.userInfo.id;

    // 1. Fetch Quiz
    const quiz = await LecturerQuiz.findById(quizId);
    if (!quiz) {
        logger.warn("Quiz missing", { quizId, userId });
        throw new AppError("Quiz not found", 404);
    }

    // 2. Check Enrollment & Approval
    const enrollment = await Enrollment.findOne({
        userId,
        course: quiz.courseId,
        status: "approved",
    });

    if (!enrollment) {
        logger.warn("Quiz denied", { quizId, userId });
        throw new AppError("You are not enrolled or approved for this course", 403);
    }

    // 3. Check Timing
    const now = new Date();
    if (now < quiz.quizStartTime) {
        logger.warn("Quiz upcoming", { quizId, userId, startTime: quiz.quizStartTime });
        throw new AppError("Quiz has not started yet", 403);
    }
    if (now > quiz.quizEndTime) {
        logger.warn("Quiz ended", { quizId, userId, endTime: quiz.quizEndTime });
        throw new AppError("Quiz has ended", 403);
    }

    // 4. Check Attempts
    const submissionCount = await LecturerQuizSubmission.countDocuments({
        quizId,
        studentId: userId,
    });

    if (quiz.attempts !== -1 && submissionCount >= quiz.attempts) {
        logger.warn("Quiz attempts max", { quizId, userId, attempts: quiz.attempts });
        throw new AppError(`You have reached the maximum number of attempts (${quiz.attempts})`, 403);
    }

    // 5. Prepare Quiz for Student (remove correct answers)
    const studentQuiz = quiz.toObject();
    studentQuiz.questions = studentQuiz.questions.map((q) => {
        const { correctAnswer, explanation, ...rest } = q;
        return rest;
    });

    logger.info("Quiz fetched", { quizId, userId, attemptsRemaining: quiz.attempts === -1 ? "unlimited" : quiz.attempts - submissionCount });
    return res.status(200).json({
        success: true,
        data: studentQuiz,
        attemptsRemaining: quiz.attempts === -1 ? "unlimited" : quiz.attempts - submissionCount,
    });
};

module.exports = asyncHandler(getQuizForStudent);
