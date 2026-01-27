const LecturerCase = require("../../../models/lecturer/cases");
const CaseQuiz = require("../../../models/lecturer/caseQuiz.Model");
const Enrollment = require("../../../models/users/enrollment.Model");
const CaseQuizSubmission = require("../../../models/users/caseQuizSubmission.Model");
const User = require("../../../models/users/user.Model");

/**
 * Submit answers for a case-attached quiz.
 * Tracks student progress by calculating score and saving the result.
 */
const submitCaseQuiz = async (req, res) => {
    try {
        const { caseId } = req.params;
        const { answers } = req.body; // Array of { questionId, selectedOption }
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
        let score = 0;
        const processedAnswers = [];

        quizQuestions.forEach((q) => {
            const studentAnswer = answers.find((a) => a.questionId.toString() === q._id.toString());
            const isCorrect = studentAnswer && studentAnswer.selectedOption === q.correctAnswer;

            if (isCorrect) score += 1;

            processedAnswers.push({
                questionId: q._id,
                selectedOption: studentAnswer ? studentAnswer.selectedOption : null,
                isCorrect,
            });
        });

        const totalPossibleScore = quizQuestions.length;

        // 5. Check if it's the first time taking this case quiz to increment lessonsCompleted
        const previousSubmission = await CaseQuizSubmission.findOne({ caseId, studentId: userId });
        if (!previousSubmission) {
            await User.findByIdAndUpdate(userId, {
                $inc: { "progress.lessonsCompleted": 1 }
            });
        }

        // 6. Save Submission
        const submission = await CaseQuizSubmission.create({
            caseId,
            studentId: userId,
            courseId: foundCase.courseId,
            score,
            totalPossibleScore,
            answers: processedAnswers,
        });

        return res.status(201).json({
            success: true,
            message: "Case quiz submitted successfully",
            data: {
                score,
                totalPossibleScore,
                submissionId: submission._id
            },
        });
    } catch (error) {
        console.error("Submit Case Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = submitCaseQuiz;
