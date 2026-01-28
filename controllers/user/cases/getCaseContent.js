const LecturerCase = require("../../../models/lecturer/lecturerCase.Model");
const CaseQuiz = require("../../../models/lecturer/caseQuiz.Model");
const Enrollment = require("../../../models/users/enrollment.Model");
const CaseQuizSubmission = require("../../../models/users/caseQuizSubmission.Model");
const generateSignedUrl = require("../../../utils/cloudinaryUrlSigner");

/**
 * Get details of a case including its AI-generated quiz for a student.
 * Validates that the student is enrolled in the course.
 */
const getCaseDetailsForStudent = async (req, res) => {
    try {
        const { caseId } = req.params;
        const userId = req.userInfo.id;

        // 1. Fetch the Case
        const foundCase = await LecturerCase.findById(caseId).lean();
        if (!foundCase) {
            return res.status(404).json({ success: false, message: "Case not found" });
        }

        // 2. Check Enrollment & Approval
        const enrollment = await Enrollment.findOne({
            userId,
            course: foundCase.courseId,
            status: "approved",
        });

        if (!enrollment) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled or approved for this course",
            });
        }

        // 3. Fetch the Quiz and Attempt Count
        const [caseQuiz, attemptCount] = await Promise.all([
            CaseQuiz.findOne({ caseId }).lean(),
            CaseQuizSubmission.countDocuments({ caseId, studentId: userId })
        ]);

        // 4. Prepare Case and Quiz for Student
        const studentCase = {
            ...foundCase,
            documentUrl: `/api/StudentCases/${caseId}/view-document`,
            documentFileName: foundCase.documentFileName,
            documentMimeType: foundCase.documentMimeType,
            quizStatus: caseQuiz ? caseQuiz.status : "not_started",
            attemptsTaken: attemptCount,
            attemptsRemaining: "unlimited",
            quiz: (caseQuiz?.questions || []).map((q) => {
                const { correctAnswer, explanation, ...rest } = q;
                return rest;
            }),
        };

        // Remove the public ID from direct response
        delete studentCase.caseDocumentPublicId;

        return res.status(200).json({
            success: true,
            data: studentCase,
        });
    } catch (error) {
        console.error("Get Case Details For Student Error:", error);
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = getCaseDetailsForStudent;
