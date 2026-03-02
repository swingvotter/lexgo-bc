const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Delete a quiz
 * 
 * @route DELETE /api/LecturerQuiz/:quizId
 * @access Private (Lecturer)
 */
const deleteQuiz = async (req, res) => {
    const { quizId } = req.params;
    const lecturerId = req.userInfo?.id;

    if (!quizId) {
        logger.warn("Quiz delete missing id", { lecturerId });
        throw new AppError("Quiz ID is required", 400);
    }

    // Find and delete the quiz while ensuring it belongs to the lecturer
    const deletedQuiz = await LecturerQuiz.findOneAndDelete({
        _id: quizId,
        lecturerId,
    });

    if (!deletedQuiz) {
        logger.warn("Quiz delete missing", { quizId, lecturerId });
        throw new AppError("Quiz not found or you're not authorized to delete it", 404);
    }

    logger.info("Quiz deleted", { quizId, lecturerId });
    return res.status(200).json({
        success: true,
        message: "Quiz deleted successfully",
        data: {
            id: deletedQuiz._id,
            title: deletedQuiz.title,
        },
    });
};

module.exports = asyncHandler(deleteQuiz);
