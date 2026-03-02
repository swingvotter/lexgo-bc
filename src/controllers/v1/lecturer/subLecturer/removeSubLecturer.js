const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Remove a sub-lecturer from a course
 * 
 * @route DELETE /api/SubLecturer/:courseId/:lecturerId
 * @access Private - Requires authentication (course owner only)
 */
const removeSubLecturer = async (req, res) => {
    const { courseId, lecturerId } = req.params;
    const ownerId = req.userInfo.id;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lecturerId)) {
        logger.warn("Sub-lecturer remove invalid ids", { courseId, lecturerId, ownerId });
        throw new AppError("Invalid course ID or lecturer ID", 400);
    }

    // Verify course exists and user is the owner
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Sub-lecturer remove course missing", { courseId, ownerId });
        throw new AppError("Course not found", 404);
    }

    if (course.lecturerId.toString() !== ownerId) {
        logger.warn("Sub-lecturer remove unauthorized", { courseId, ownerId });
        throw new AppError("Only the course owner can remove sub-lecturers", 403);
    }

    // Remove sub-lecturer record
    const result = await SubLecturer.findOneAndDelete({
        courseId,
        lecturerId,
    });

    if (!result) {
        logger.warn("Sub-lecturer remove missing", { courseId, lecturerId });
        throw new AppError("Sub-lecturer not found for this course", 404);
    }

    logger.info("Sub-lecturer removed", { courseId, lecturerId });
    return res.status(200).json({
        success: true,
        message: "Sub-lecturer removed successfully",
    });
};

module.exports = asyncHandler(removeSubLecturer);
