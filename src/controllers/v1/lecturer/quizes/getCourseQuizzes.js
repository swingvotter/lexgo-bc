const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const getPagination = require(path.utils.pagination);

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

        const { page, limit, skip } = getPagination(req.query);

        const filter = { courseId, lecturerId };

        // Find quizzes for this course that belong to this lecturer with pagination
        const [quizzes, total] = await Promise.all([
            LecturerQuiz.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            LecturerQuiz.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            data: quizzes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
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
