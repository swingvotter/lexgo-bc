const path = require('../../../../path');
const Enrollment = require(path.models.users.enrollment);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Fetch all enrollments with pagination and populated fields
 */
const adminFetchEnrollmentsHandler = async (req, res) => {
    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const query = {};

    // Status filter
    if (req.query.status) {
        const allowedStatus = ["pending", "approved", "rejected"];
        if (allowedStatus.includes(req.query.status)) {
            query.status = req.query.status;
        }
    }

    // Execute queries in parallel
    const [result, totalItems] = await Promise.all([
        cursorPagination({
            model: Enrollment,
            filter: query,
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        Enrollment.countDocuments(query),
    ]);

    const enrollments = await Enrollment.populate(result.data, [
        { path: "userId", select: "firstName lastName email" },
        { path: "course", select: "title courseCode category level" },
    ]);

    logger.info("Enrollments fetched", { count: enrollments.length, limit, cursor });
    return res.status(200).json({
        success: true,
        message: "Enrollments fetched successfully",
        data: enrollments,
        totalItems,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(adminFetchEnrollmentsHandler);
