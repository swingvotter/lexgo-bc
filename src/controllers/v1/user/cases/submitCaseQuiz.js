const mongoose = require("mongoose");
const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const Enrollment = require(path.models.users.enrollment);
const CaseQuizSubmission = require(path.models.users.caseQuizSubmission);
const User = require(path.models.users.user);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Submit answers for a case-attached quiz.
 * Tracks student progress by calculating score and saving the result.
 */
const submitCaseQuiz = async (req, res) => {
    const session = await mongoose.startSession();

    const { caseId } = req.params;
    const { answers } = req.body || {}; // Array of { questionId, selectedOption }
    const userId = req.userInfo.id;

    // 1. Fetch the Case
    const foundCase = await LecturerCase.findById(caseId);
    if (!foundCase) {
        logger.warn("Case missing", { caseId, userId });
        throw new AppError("Case not found", 404);
    }

    // 2. Check Enrollment
    const enrollment = await Enrollment.findOne({
        userId,
        course: foundCase.courseId,
        status: "approved",
    });
    if (!enrollment) {
        logger.warn("Case denied", { caseId, userId });
        throw new AppError("Unauthorized: You must be enrolled and approved.", 403);
    }

    // 3. Fetch the Quiz
    const caseQuiz = await CaseQuiz.findOne({ caseId });
    const quizQuestions = caseQuiz?.questions || [];

    if (quizQuestions.length === 0) {
        logger.warn("Case quiz missing", { caseId, userId });
        throw new AppError("This case has no quiz attached or it is not yet generated.", 400);
    }

    // 4. Calculate Score
    if (!answers || !Array.isArray(answers)) {
        logger.warn("Case answers invalid", { caseId, userId });
        throw new AppError("Answers must be an array", 400);
    }

    let score = 0;
    const processedAnswers = [];

    quizQuestions.forEach((q) => {
        const studentAnswer = answers.find((a) => a.questionId && a.questionId.toString() === q._id.toString());

        // Robust comparison: trim and ignore case for letter-based answers (A, B, C, D)
        const normalizedStudentAns = studentAnswer?.selectedOption?.toString().trim().toUpperCase();
        const normalizedCorrectAns = q.correctAnswer?.toString().trim().toUpperCase();

        const isCorrect = normalizedStudentAns === normalizedCorrectAns;

        if (isCorrect) score += 1;

        processedAnswers.push({
            questionId: q._id,
            selectedOption: studentAnswer ? studentAnswer.selectedOption : null,
            isCorrect,
        });
    });

    const totalPossibleScore = quizQuestions.length;

    const result = await session.withTransaction(async () => {
        // 5. Check submission count for lesson progress increment
        const submissionCount = await CaseQuizSubmission.countDocuments({ caseId, studentId: userId }).session(session);

        // 6. Increment lessonsCompleted only on the VERY FIRST attempt
        if (submissionCount === 0) {
            await User.findByIdAndUpdate(userId, {
                $inc: { "progress.lessonsCompleted": 1 }
            }, { session });
        }

        // 7. Save Submission
        const [submission] = await CaseQuizSubmission.create([{
            caseId,
            studentId: userId,
            courseId: foundCase.courseId,
            score,
            totalPossibleScore,
            answers: processedAnswers,
        }], { session });

        // 8. Calculate and update case quiz statistics
        const allCaseSubmissions = await CaseQuizSubmission.find({
            studentId: userId,
        }).session(session);

        const totalCaseQuizzes = allCaseSubmissions.length;
        const totalPercentageSum = allCaseSubmissions.reduce((sum, sub) => {
            return sum + (sub.score / sub.totalPossibleScore) * 100;
        }, 0);
        const averageScore = totalCaseQuizzes > 0 ? Math.round((totalPercentageSum / totalCaseQuizzes) * 100) / 100 : 0;

        await User.findByIdAndUpdate(userId, {
            "quizStatistics.caseGeneratedQuiz.totalQuizzes": totalCaseQuizzes,
            "quizStatistics.caseGeneratedQuiz.averageScore": averageScore,
        }, { session });

        return { submission, submissionCount };
    }).finally(() => session.endSession());

    logger.info("Case quiz saved", { caseId, userId, score });
    return res.status(201).json({
        success: true,
        message: "Case quiz submitted successfully",
        data: {
            score,
            totalPossibleScore,
            submissionId: result.submission._id,
            attemptNumber: result.submissionCount + 1,
            attemptsRemaining: "unlimited"
        },
    });
};

module.exports = asyncHandler(submitCaseQuiz);
