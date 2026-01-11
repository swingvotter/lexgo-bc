const LecturerQuiz = require("../../../models/lecturer/quizes");

/**
 * Get all quizzes for a specific course
 * 
 * @route GET /api/LecturerQuiz/course/:courseId
 * @access Private (Lecturer)
 */
const getCourseQuizzes = async (req, res) => {
    try {
        const { courseId } = req.params;
        const lecturerId = req.userInfo?.id;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course ID is required",
            });
        }

        // Find all quizzes for this course that belong to this lecturer
        const quizzes = await LecturerQuiz.find({
            courseId,
            lecturerId,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: quizzes.length,
            data: quizzes,
        });
    } catch (error) {
        console.error("Get Course Quizzes Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching course quizzes",
        });
    }
};

module.exports = getCourseQuizzes;
