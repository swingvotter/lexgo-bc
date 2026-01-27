const mongoose = require("mongoose");
const LecturerCase = require("../../../models/lecturer/cases");
const CaseQuiz = require("../../../models/lecturer/caseQuiz.Model");
const CaseQuizSubmission = require("../../../models/users/caseQuizSubmission.Model");
const cloudinary = require("../../../config/cloudinary");

const deleteCase = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        const { id } = req.params;
        const lecturerId = req.userInfo.id;

        if (!id) {
            return res.status(400).json({ success: false, message: "Case ID is required" });
        }

        // Start Transaction
        session.startTransaction();

        // 1. Ensure the case belongs to the lecturer
        const deletedCase = await LecturerCase.findOneAndDelete({ _id: id, lecturerId }).session(session);

        if (!deletedCase) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Case not found or unauthorized" });
        }

        // 2. Delete Case Quiz and Quiz Submissions
        await CaseQuiz.findOneAndDelete({ caseId: id }).session(session);
        await CaseQuizSubmission.deleteMany({ caseId: id }).session(session);

        await session.commitTransaction();

        // Step 2: Cleanup associated data (Outside transaction as Cloudinary is external)
        // 1. Delete document from Cloudinary
        if (deletedCase.caseDocumentPublicId) {
            try {
                await cloudinary.uploader.destroy(deletedCase.caseDocumentPublicId, { resource_type: "raw", type: "private" });
            } catch (err) {
                console.error("Cloudinary delete error:", err.message);
            }
        }

        return res.status(200).json({ success: true, message: "Case and all its related data (quizzes, submissions) deleted successfully" });

    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.error("Delete case error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    } finally {
        session.endSession();
    }
};

module.exports = deleteCase;
