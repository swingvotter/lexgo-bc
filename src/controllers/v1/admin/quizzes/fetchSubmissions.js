const path = require("../../../path");
const LecturerQuizSubmission = require(path.models.users.lecturerQuizSubmission);
const getPagination = require(path.utils.pagination);

/**
 * Fetch all student quiz submissions with pagination and populated fields
 * to track student progress and performance.
 */
const adminFetchQuizSubmissionsHandler = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req.query);

        const query = {};

        // Filter by studentId if provided
        if (req.query.studentId) {
            query.studentId = req.query.studentId;
        }

        // Filter by courseId if provided
        if (req.query.courseId) {
            query.courseId = req.query.courseId;
        }

        // Filter by quizId if provided
        if (req.query.quizId) {
            query.quizId = req.query.quizId;
        }

        // Execute queries in parallel
        const [submissions, totalItems] = await Promise.all([
            LecturerQuizSubmission.find(query)
                .populate("studentId", "firstName lastName email")
                .populate("courseId", "title courseCode")
                .populate("quizId", "title totalMarks")
                .sort({ completedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            LecturerQuizSubmission.countDocuments(query),
        ]);

        const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 0;

        return res.status(200).json({
            success: true,
            message: "Quiz submissions fetched successfully",
            data: submissions,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                startIndex: totalItems > 0 ? (page - 1) * limit + 1 : 0,
                endIndex: Math.min(page * limit, totalItems),
            },
        });
    } catch (error) {
        console.error("Fetch quiz submissions error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch quiz submissions. Please try again later.",
        });
    }
};

module.exports = adminFetchQuizSubmissionsHandler;
