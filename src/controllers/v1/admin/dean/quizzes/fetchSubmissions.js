const path = require('../../../../path');
const LecturerQuizSubmission = require(path.models.users.lecturerQuizSubmission);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Fetch all student quiz submissions with pagination and populated fields
 * to track student progress and performance.
 */
const adminFetchQuizSubmissionsHandler = async (req, res) => {
    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

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
    const [result, totalItems] = await Promise.all([
        cursorPagination({
            model: LecturerQuizSubmission,
            filter: query,
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        LecturerQuizSubmission.countDocuments(query),
    ]);

    const submissions = await LecturerQuizSubmission.populate(result.data, [
        { path: "studentId", select: "firstName lastName email" },
        { path: "courseId", select: "title courseCode" },
        { path: "quizId", select: "title totalMarks" },
    ]);

    logger.info("Quiz submissions fetched", { count: submissions.length, limit, cursor });
    return res.status(200).json({
        success: true,
        message: "Quiz submissions fetched successfully",
        data: submissions,
        totalItems,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(adminFetchQuizSubmissionsHandler);
