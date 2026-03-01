const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const Enrollment = require(path.models.users.enrollment);
const LecturerQuizSubmission = require(path.models.users.lecturerQuizSubmission);
const User = require(path.models.users.user);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Submit quiz answers
 */
const submitQuiz = async (req, res) => {
    const { quizId } = req.params;
    const { answers } = req.body || {}; // Array of { questionId, selectedOption }
    const userId = req.userInfo.id;

    const quiz = await LecturerQuiz.findById(quizId);
    if (!quiz) {
        logger.warn("Quiz missing", { quizId, userId });
        throw new AppError("Quiz not found", 404);
    }

    // 1. Check Enrollment & Timing & Attempts (Security/Validation)
    const enrollment = await Enrollment.findOne({
        userId,
        course: quiz.courseId,
        status: "approved",
    });
    if (!enrollment) {
        logger.warn("Quiz denied", { quizId, userId });
        throw new AppError("Unauthorized: You must be enrolled and approved to submit this quiz.", 403);
    }

    const now = new Date();
    if (now < quiz.quizStartTime || now > quiz.quizEndTime) {
        logger.warn("Quiz closed", { quizId, userId });
        throw new AppError("Quiz is not currently available", 403);
    }

    const submissionCount = await LecturerQuizSubmission.countDocuments({
        quizId,
        studentId: userId,
    });
    if (quiz.attempts !== -1 && submissionCount >= quiz.attempts) {
        logger.warn("Quiz attempts max", { quizId, userId, attempts: quiz.attempts });
        throw new AppError("Max attempts reached", 403);
    }

    // 2. Calculate Score
    if (!answers || !Array.isArray(answers)) {
        logger.warn("Quiz answers invalid", { quizId, userId });
        throw new AppError("Answers must be an array", 400);
    }

    let score = 0;
    const processedAnswers = [];

    quiz.questions.forEach((q) => {
        const studentAnswer = answers.find((a) => a.questionId && a.questionId.toString() === q._id.toString());

        // Robust comparison
        const normalizedStudentAns = studentAnswer?.selectedOption?.toString().trim().toUpperCase();
        const normalizedCorrectAns = q.correctAnswer?.toString().trim().toUpperCase();

        const isCorrect = normalizedStudentAns === normalizedCorrectAns;

        if (isCorrect) score += (quiz.grade.markPerQuestion || 1);

        processedAnswers.push({
            questionId: q._id,
            selectedOption: studentAnswer ? studentAnswer.selectedOption : null,
            isCorrect,
        });
    });

    const totalPossibleScore = quiz.questions.length * (quiz.grade.markPerQuestion || 1);

    // 3. Save Submission
    const submission = await LecturerQuizSubmission.create({
        quizId,
        studentId: userId,
        courseId: quiz.courseId,
        score,
        totalPossibleScore,
        attemptNumber: submissionCount + 1,
        answers: processedAnswers,
    });

    // 4. Calculate and update course quiz statistics
    const allCourseSubmissions = await LecturerQuizSubmission.find({
        studentId: userId,
    });

    const totalCourseQuizzes = allCourseSubmissions.length;
    const totalPercentageSum = allCourseSubmissions.reduce((sum, sub) => {
        return sum + (sub.score / sub.totalPossibleScore) * 100;
    }, 0);
    const averageScore = totalCourseQuizzes > 0 ? Math.round((totalPercentageSum / totalCourseQuizzes) * 100) / 100 : 0;

    await User.findByIdAndUpdate(userId, {
        "quizStatistics.courseQuiz.totalQuizzes": totalCourseQuizzes,
        "quizStatistics.courseQuiz.averageScore": averageScore,
    });

    logger.info("Quiz submitted", { quizId, userId, score, attemptNumber: submission.attemptNumber });
    return res.status(201).json({
        success: true,
        message: "Quiz submitted successfully",
        data: {
            score,
            totalPossibleScore,
            attemptNumber: submission.attemptNumber,
            showScoresImmediately: quiz.showScoresImmediately,
            ...(quiz.showScoresImmediately ? { results: processedAnswers } : {}),
        },
    });
};

module.exports = {
    submitQuiz: asyncHandler(submitQuiz),
};
