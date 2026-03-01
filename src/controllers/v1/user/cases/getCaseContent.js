const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const Enrollment = require(path.models.users.enrollment);
const CaseQuizSubmission = require(path.models.users.caseQuizSubmission);
const generateSignedUrl = require(path.utils.cloudinaryUrlSigner);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get details of a case including its AI-generated quiz for a student.
 * Validates that the student is enrolled in the course.
 */
const getCaseDetailsForStudent = async (req, res) => {
    const { caseId } = req.params;
    const userId = req.userInfo.id;

    // 1. Fetch the Case
    const foundCase = await LecturerCase.findById(caseId).lean();
    if (!foundCase) {
        logger.warn("Case missing", { caseId, userId });
        throw new AppError("Case not found", 404);
    }

    // 2. Check Enrollment & Approval
    const enrollment = await Enrollment.findOne({
        userId,
        course: foundCase.courseId,
        status: "approved",
    });

    if (!enrollment) {
        logger.warn("Case denied", { caseId, userId });
        throw new AppError("You are not enrolled or approved for this course", 403);
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

    logger.info("Case fetched", { caseId, userId, attemptsTaken: attemptCount });
    return res.status(200).json({
        success: true,
        data: studentCase,
    });
};

module.exports = asyncHandler(getCaseDetailsForStudent);
