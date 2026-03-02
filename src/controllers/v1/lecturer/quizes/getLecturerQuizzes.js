const path = require('../../../../path');
const LecturerQuiz = require(path.models.lecturer.quiz);
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get all quizzes created by a lecturer with pagination
 * 
 * @route GET /api/LecturerQuiz/my-quizzes
 * @access Private (Lecturer)
 */
const getLecturerQuizzes = async (req, res) => {
    const lecturerId = req.userInfo?.id;

    if (!lecturerId) {
        logger.warn("Lecturer quizzes unauthorized");
        throw new AppError("Unauthorized", 401);
    }

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const [result, totalQuizzes] = await Promise.all([
        cursorPagination({
            model: LecturerQuiz,
            filter: { lecturerId },
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        LecturerQuiz.countDocuments({ lecturerId })
    ]);

    logger.info("Lecturer quizzes fetched", { lecturerId, count: result.data.length, limit, cursor });
    return res.status(200).json({
        success: true,
        data: result.data,
        total: totalQuizzes,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getLecturerQuizzes);
