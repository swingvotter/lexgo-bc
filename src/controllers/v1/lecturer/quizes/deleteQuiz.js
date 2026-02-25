const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);

/**
 * Delete a quiz
 * 
 * @route DELETE /api/LecturerQuiz/:quizId
 * @access Private (Lecturer)
 */
const deleteQuiz = async (req, res) => {
    try {
        const { quizId } = req.params;
        const lecturerId = req.userInfo?.id;

        if (!quizId) {
            return res.status(400).json({
                success: false,
                message: "Quiz ID is required",
            });
        }

        // Find and delete the quiz while ensuring it belongs to the lecturer
        const deletedQuiz = await LecturerQuiz.findOneAndDelete({
            _id: quizId,
            lecturerId,
        });

        if (!deletedQuiz) {
            return res.status(404).json({
                success: false,
                message: "Quiz not found or you're not authorized to delete it",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Quiz deleted successfully",
            data: {
                id: deletedQuiz._id,
                title: deletedQuiz.title,
            },
        });
    } catch (error) {
        console.error("Delete Quiz Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting quiz",
        });
    }
};

module.exports = deleteQuiz;
