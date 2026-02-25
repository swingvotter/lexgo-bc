const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const getPagination = require(path.utils.pagination);

/**
 * Get all quizzes created by a lecturer with pagination
 * 
 * @route GET /api/LecturerQuiz/my-quizzes
 * @access Private (Lecturer)
 */
const getLecturerQuizzes = async (req, res) => {
    try {
        const lecturerId = req.userInfo?.id;

        if (!lecturerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            });
        }

        // Get pagination parameters using the utility
        const { page, limit, skip } = getPagination(req.query);

        // Fetch quizzes with pagination
        const quizzes = await LecturerQuiz.find({ lecturerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select("-questions"); // Excluding questions for a better list view performance

        // Get total count for pagination metadata
        const totalQuizzes = await LecturerQuiz.countDocuments({ lecturerId });

        return res.status(200).json({
            success: true,
            data: quizzes,
            pagination: {
                totalItems: totalQuizzes,
                totalPages: Math.ceil(totalQuizzes / limit),
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("Get Lecturer Quizzes Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching lecturer quizzes",
        });
    }
};

module.exports = getLecturerQuizzes;
