const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get pending sub-lecturer requests for a course
 * 
 * @route GET /api/SubLecturer/requests/:courseId
 * @access Private - Requires authentication (course owner only)
 */
const getPendingSubLecturers = async (req, res) => {
    const { courseId } = req.params;
    const ownerId = req.userInfo.id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        logger.warn("Sub-lecturers pending invalid course", { courseId, ownerId });
        throw new AppError("Invalid course ID", 400);
    }

    // Verify course exists and user is the owner
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Sub-lecturers pending course missing", { courseId, ownerId });
        throw new AppError("Course not found", 404);
    }

    if (course.lecturerId.toString() !== ownerId) {
        logger.warn("Sub-lecturers pending unauthorized", { courseId, ownerId });
        throw new AppError("Only the course owner can view sub-lecturer requests", 403);
    }

    // Get pending requests
    const requests = await SubLecturer.find({
        courseId,
        status: "pending",
    }).populate("lecturerId", "firstName lastName email");

    logger.info("Sub-lecturer requests fetched", { courseId, count: requests.length });
    return res.status(200).json({
        success: true,
        message: "Pending sub-lecturer requests fetched successfully",
        data: requests,
    });
};

module.exports = asyncHandler(getPendingSubLecturers);
