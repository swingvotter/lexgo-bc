const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get all quizzes for a specific course
 * 
 * @route GET /api/LecturerQuiz/course/:courseId
 * @access Private (Lecturer)
 */
const getCourseQuizzes = async (req, res) => {
    const { courseId } = req.params;
    const lecturerId = req.userInfo?.id;

    if (!courseId) {
        logger.warn("Course quizzes missing course", { lecturerId });
        throw new AppError("Course ID is required", 400);
    }

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const filter = { courseId, lecturerId };

    // Find quizzes for this course that belong to this lecturer with pagination
    const [result, total] = await Promise.all([
        cursorPagination({
            model: LecturerQuiz,
            filter,
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        LecturerQuiz.countDocuments(filter)
    ]);

    logger.info("Course quizzes fetched", { courseId, count: result.data.length, limit, cursor });
    return res.status(200).json({
        success: true,
        data: result.data,
        total,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getCourseQuizzes);
