const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get approved sub-lecturers for a course
 * 
 * @route GET /api/SubLecturer/:courseId
 * @access Private - Requires authentication (course owner only)
 */
const getSubLecturers = async (req, res) => {
    const { courseId } = req.params;
    const ownerId = req.userInfo.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        logger.warn("Sub-lecturers invalid course", { courseId, ownerId });
        throw new AppError("Invalid course ID", 400);
    }

    // Verify course exists and user is the owner
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Sub-lecturers course missing", { courseId, ownerId });
        throw new AppError("Course not found", 404);
    }

    if (course.lecturerId.toString() !== ownerId) {
        logger.warn("Sub-lecturers unauthorized", { courseId, ownerId });
        throw new AppError("Only the course owner can view sub-lecturers", 403);
    }

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;
    const filter = {
        courseId,
        status: "approved",
    };

    // Get approved sub-lecturers with pagination
    const [result, total] = await Promise.all([
        cursorPagination({
            model: SubLecturer,
            filter,
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        SubLecturer.countDocuments(filter)
    ]);

    const subLecturers = await SubLecturer.populate(result.data, {
        path: "lecturerId",
        select: "firstName lastName email",
    });

    logger.info("Sub-lecturers fetched", { courseId, count: subLecturers.length, limit, cursor });
    return res.status(200).json({
        success: true,
        data: subLecturers,
        total,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getSubLecturers);
