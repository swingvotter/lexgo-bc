const mongoose = require("mongoose");
const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const Enrollment = require(path.models.users.enrollment);
const CaseQuizSubmission = require(path.models.users.caseQuizSubmission);
const User = require(path.models.users.user);

/**
 * Submit answers for a case-attached quiz.
 * Tracks student progress by calculating score and saving the result.
 */
const submitCaseQuiz = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { caseId } = req.params;
        const { answers } = req.body || {}; // Array of { questionId, selectedOption }
        const userId = req.userInfo.id;

        // 1. Fetch the Case
        const foundCase = await LecturerCase.findById(caseId);
        if (!foundCase) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        // 2. Check Enrollment
        const enrollment = await Enrollment.findOne({
            userId,
            course: foundCase.courseId,
            status: "approved",
        });
        if (!enrollment) {
            return res.status(403).json({ success: false, message: "Unauthorized: You must be enrolled and approved." });
        }

        // 3. Fetch the Quiz
        const caseQuiz = await CaseQuiz.findOne({ caseId });
        const quizQuestions = caseQuiz?.questions || [];

        if (quizQuestions.length === 0) {
            return res.status(400).json({ success: false, message: "This case has no quiz attached or it is not yet generated." });
        }

        // 4. Calculate Score
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ success: false, message: "Answers must be an array" });
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

        // Start Transaction for mutations
        session.startTransaction();

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

        await session.commitTransaction();

        return res.status(201).json({
            success: true,
            message: "Case quiz submitted successfully",
            data: {
                score,
                totalPossibleScore,
                submissionId: submission._id,
                attemptNumber: submissionCount + 1,
                attemptsRemaining: "unlimited"
            },
        });
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Submit Case Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = submitCaseQuiz;
