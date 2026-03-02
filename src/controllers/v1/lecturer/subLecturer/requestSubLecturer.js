const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const User = require(path.models.users.user);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Request to become a sub-lecturer for a course
 * 
 * @route POST /api/SubLecturer/request/:courseId
 * @access Private - Requires authentication (lecturer only)
 */
const requestSubLecturer = async (req, res) => {
    const { courseId } = req.params;
    const lecturerId = req.userInfo.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        logger.warn("Sub-lecturer invalid course", { courseId, lecturerId });
        throw new AppError("Invalid course ID", 400);
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Sub-lecturer course missing", { courseId, lecturerId });
        throw new AppError("Course not found", 404);
    }

    // Cannot request for own course
    if (course.lecturerId.toString() === lecturerId) {
        logger.warn("Sub-lecturer own course", { courseId, lecturerId });
        throw new AppError("You are the owner of this course", 400);
    }

    // Check if request already exists
    const existing = await SubLecturer.findOne({ courseId, lecturerId });
    if (existing) {
        logger.warn("Sub-lecturer request exists", { courseId, lecturerId, status: existing.status });
        throw new AppError(`You already have a ${existing.status} request for this course`, 400);
    }

    // Create pending request
    const request = await SubLecturer.create({
        courseId,
        lecturerId,
        status: "pending",
    });

    logger.info("Sub-lecturer requested", { courseId, lecturerId, requestId: request?._id });
    return res.status(201).json({
        success: true,
        message: "Sub-lecturer request submitted successfully",
        data: request,
    });
};

module.exports = asyncHandler(requestSubLecturer);
