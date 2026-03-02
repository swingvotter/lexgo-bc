const path = require('../../../path');
const Enrollment = require(path.models.users.enrollment);
const Course = require(path.models.lecturer.course);
const cursorPagination = require(path.utils.cursorPagination);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);


/**
 * Get all enrolled (approved) courses for the authenticated student
 * 
 * @route GET /api/Enrollments/my-courses
 * @access Private - Requires authentication (student)
 * 
 * @description Fetches all courses where the student's enrollment
 * has been approved by the lecturer. Returns course details including
 * title, code, category, and other metadata.
 * 
 * @returns {Object} Array of enrolled course objects
 */
const getEnrolledCourses = async (req, res) => {
    const userId = req.userInfo.id; // Get student ID from auth middleware

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const filter = {
        userId,
        status: "approved",
    };

    // Query enrollments with approved status and pagination
    const [result, total] = await Promise.all([
        cursorPagination({
            model: Enrollment,
            filter,
            limit,
            cursor,
            projection: {},
            sort: { _id: -1 },
        }),
        Enrollment.countDocuments(filter)
    ]);

    const enrollments = await Enrollment.populate(result.data, {
        path: "course",
        select: "title courseCode category institution level description courseImageUrl",
    });

    // Map enrollments to return just the course objects
    const courses = enrollments.map((enrollment) => enrollment.course);

    logger.info("Enrolled courses fetched", { userId, count: courses.length, limit, cursor });
    return res.status(200).json({
        success: true,
        message: "Enrolled courses fetched successfully",
        data: courses,
        total,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getEnrolledCourses);
