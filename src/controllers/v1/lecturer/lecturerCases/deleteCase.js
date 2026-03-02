const mongoose = require("mongoose");
const path = require('../../../../path');
const LecturerCase = require(path.models.lecturer.case);
const CaseQuiz = require(path.models.lecturer.caseQuiz);
const CaseQuizSubmission = require(path.models.users.caseQuizSubmission);
const cloudinary = require(path.config.cloudinary);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const deleteCase = async (req, res) => {
    const session = await mongoose.startSession();
    const { id } = req.params;
    const lecturerId = req.userInfo.id;
    let deletedCase;

    if (!id) {
        logger.warn("Case delete missing id", { lecturerId });
        throw new AppError("Case ID is required", 400);
    }

    await session.withTransaction(async () => {
        // 1. Ensure the case belongs to the lecturer
        deletedCase = await LecturerCase.findOneAndDelete({ _id: id, lecturerId }).session(session);

        if (!deletedCase) {
            logger.warn("Case delete missing", { caseId: id, lecturerId });
            throw new AppError("Case not found or unauthorized", 404);
        }

        // 2. Delete Case Quiz and Quiz Submissions
        await CaseQuiz.findOneAndDelete({ caseId: id }).session(session);
        await CaseQuizSubmission.deleteMany({ caseId: id }).session(session);
    }).finally(() => session.endSession());

    // Step 2: Cleanup associated data (Outside transaction as Cloudinary is external)
    // 1. Delete document from Cloudinary
    if (deletedCase?.caseDocumentPublicId) {
        await cloudinary.uploader.destroy(deletedCase.caseDocumentPublicId, { resource_type: "raw", type: "private" });
    }

    logger.info("Case deleted", { caseId: id, lecturerId });
    return res.status(200).json({ success: true, message: "Case and all its related data (quizzes, submissions) deleted successfully" });
}; 

module.exports = asyncHandler(deleteCase);
