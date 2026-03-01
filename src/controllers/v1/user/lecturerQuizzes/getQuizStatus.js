const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const Enrollment = require(path.models.users.enrollment);
const LecturerQuizSubmission = require(path.models.users.lecturerQuizSubmission);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get the status of a specific quiz for the authenticated student.
 * Returns submission status, score, attempts remaining, and timing info.
 */
const getQuizStatus = async (req, res) => {
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

    // 3. Fetch Student's Submissions for this quiz
    const submissions = await LecturerQuizSubmission.find({
        quizId,
        studentId: userId,
    }).sort({ createdAt: -1 });

    const submissionCount = submissions.length;
    const lastSubmission = submissions[0] || null;

    // 4. Calculate status
    const now = new Date();
    let availability = "available";
    if (now < quiz.quizStartTime) availability = "upcoming";
    else if (now > quiz.quizEndTime) availability = "ended";

    const hasSubmitted = submissionCount > 0;
    const attemptsRemaining = quiz.attempts === -1 ? "unlimited" : Math.max(0, quiz.attempts - submissionCount);

    logger.info("Quiz status", { quizId, userId, availability, submissionCount, attemptsRemaining });
    return res.status(200).json({
        success: true,
        data: {
            quizId: quiz._id,
            title: quiz.title,
            availability,
            startTime: quiz.quizStartTime,
            endTime: quiz.quizEndTime,
            hasSubmitted,
            submissionCount,
            attemptsRemaining,
            lastScore: lastSubmission ? lastSubmission.score : null,
            totalPossibleScore: lastSubmission ? lastSubmission.totalPossibleScore : null,
            showScoresImmediately: quiz.showScoresImmediately,
        }
    });
};

module.exports = asyncHandler(getQuizStatus);
