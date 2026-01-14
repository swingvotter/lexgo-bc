const LecturerQuiz = require("../../../models/lecturer/quizes");
const Enrollment = require("../../../models/users/enrollment.Model");
const LecturerQuizSubmission = require("../../../models/users/lecturerQuizSubmission.Model");

/**
 * Get the status of a specific quiz for the authenticated student.
 * Returns submission status, score, attempts remaining, and timing info.
 */
const getQuizStatus = async (req, res) => {
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

    } catch (error) {
        console.error("Get Quiz Status Error:", error);
        return res.status(500).json({ success: false, message: "Server error while fetching quiz status" });
    }
};

module.exports = getQuizStatus;
