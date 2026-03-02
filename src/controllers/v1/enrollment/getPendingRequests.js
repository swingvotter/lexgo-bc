const path = require('../../../path');
const Enrollment = require(path.models.users.enrollment);
const Course = require(path.models.lecturer.course);
const User = require(path.models.users.user);
const mongoose = require("mongoose");
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);


/**
 * Get pending enrollment requests for a specific course
 * 
 * @route GET /api/Enrollments/requests/:courseId/pending
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Fetches all enrollment requests with "pending" status
 * for a specific course. Only the course owner (lecturer) can view
 * these requests. Includes student details for review.
 * 
 * @param {string} req.params.courseId - The course ID to get requests for
 * @returns {Object} Array of pending enrollment requests with user details
 */
const getPendingRequests = async (req, res) => {
    const { courseId } = req.params;
    const lecturerId = req.userInfo.id; // Get lecturer ID from auth middleware

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        logger.warn("Pending requests invalid course", { courseId, lecturerId });
        throw new AppError("Invalid course ID", 400);
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Pending requests course missing", { courseId, lecturerId });
        throw new AppError("Course not found", 404);
    }

    // Authorization: Only the course owner can view enrollment requests
    if (course.lecturerId.toString() !== lecturerId) {
        logger.warn("Pending requests unauthorized", { courseId, lecturerId });
        throw new AppError("You are not authorized to view enrollments for this course", 403);
    }

    const limit = Number(req.query.limit || 25);
    const cursor = req.query.cursor || null;

    const filter = {
        course: courseId,
        status: "pending",
    };

    // Fetch pending enrollments with student and course details
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

    const pendingEnrollments = await Enrollment.populate(result.data, [
        { path: "userId", select: "email firstName lastName" },
        { path: "course", select: "title courseCode" }
    ]);

    logger.info("Pending requests fetched", { courseId, count: pendingEnrollments.length, limit, cursor });
    return res.status(200).json({
        success: true,
        message: "Pending enrollment requests fetched successfully",
        data: pendingEnrollments,
        total,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getPendingRequests);
