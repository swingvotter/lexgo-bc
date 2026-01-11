const LecturerQuiz = require("../../../models/lecturer/quizes");
const Enrollment = require("../../../models/users/enrollment.Model");
const LecturerQuizSubmission = require("../../../models/users/lecturerQuizSubmission.Model");

/**
 * Get quiz details for a student
 * Validates enrollment, timing, and attempts.
 */
const getQuizForStudent = async (req, res) => {
    try {
        const { quizId } = req.params;
        const userId = req.userInfo.id;

        // 1. Fetch Quiz
        const quiz = await LecturerQuiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // 2. Check Enrollment & Approval
        const enrollment = await Enrollment.findOne({
            userId,
            course: quiz.courseId,
            status: "approved",
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled or approved for this course",
            });
        }

        // 3. Check Timing
        const now = new Date();
        if (now < quiz.quizStartTime) {
            return res.status(403).json({
                success: false,
                message: "Quiz has not started yet",
                startTime: quiz.quizStartTime,
            });
        }
        if (now > quiz.quizEndTime) {
            return res.status(403).json({
                success: false,
                message: "Quiz has ended",
                endTime: quiz.quizEndTime,
                currentTime: now
            });
        }

        // 4. Check Attempts
        const submissionCount = await LecturerQuizSubmission.countDocuments({
            quizId,
            studentId: userId,
        });

        if (quiz.attempts !== -1 && submissionCount >= quiz.attempts) {
            return res.status(403).json({
                success: false,
                message: `You have reached the maximum number of attempts (${quiz.attempts})`,
            });
        }

        // 5. Prepare Quiz for Student (remove correct answers)
        const studentQuiz = quiz.toObject();
        studentQuiz.questions = studentQuiz.questions.map((q) => {
            const { correctAnswer, explanation, ...rest } = q;
            return rest;
        });

        return res.status(200).json({
            success: true,
            data: studentQuiz,
            attemptsRemaining: quiz.attempts === -1 ? "unlimited" : quiz.attempts - submissionCount,
        });
    } catch (error) {
        console.error("Get Quiz For Student Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Submit quiz answers
 */
const submitQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const { answers } = req.body; // Array of { questionId, selectedOption }
        const userId = req.userInfo.id;

        const quiz = await LecturerQuiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ success: false, message: "Quiz not found" });
        }

        // 1. Check Enrollment & Timing & Attempts (Security/Validation)
        const enrollment = await Enrollment.findOne({
            userId,
            course: quiz.courseId,
            status: "approved",
        });
        if (!enrollment) return res.status(403).json({ success: false, message: "Unauthorized: You must be enrolled and approved to submit this quiz." });

        const now = new Date();
        if (now < quiz.quizStartTime || now > quiz.quizEndTime) {
            return res.status(403).json({ success: false, message: "Quiz is not currently available" });
        }

        const submissionCount = await LecturerQuizSubmission.countDocuments({
            quizId,
            studentId: userId,
        });
        if (quiz.attempts !== -1 && submissionCount >= quiz.attempts) {
            return res.status(403).json({ success: false, message: "Max attempts reached" });
        }

        // 2. Calculate Score
        let score = 0;
        const processedAnswers = [];

        quiz.questions.forEach((q) => {
            const studentAnswer = answers.find((a) => a.questionId.toString() === q._id.toString());
            const isCorrect = studentAnswer && studentAnswer.selectedOption === q.correctAnswer;

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
    } catch (error) {
        console.error("Submit Quiz Error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getQuizForStudent,
    submitQuiz,
};
