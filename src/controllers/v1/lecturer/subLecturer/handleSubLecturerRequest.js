const path = require('../../../../path');
const SubLecturer = require(path.models.lecturer.subLecturer);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Approve or reject a sub-lecturer request
 * 
 * @route PATCH /api/SubLecturer/request/:courseId/:lecturerId
 * @access Private - Requires authentication (course owner only)
 */
const handleSubLecturerRequest = async (req, res) => {
    const { courseId, lecturerId } = req.params;
    const { action } = req.body || {};
    const ownerId = req.userInfo.id;

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(lecturerId)) {
        logger.warn("Sub-lecturer invalid ids", { courseId, lecturerId, ownerId });
        throw new AppError("Invalid course ID or lecturer ID", 400);
    }

    if (!action || !["approve", "reject"].includes(action)) {
        logger.warn("Sub-lecturer invalid action", { action, courseId, lecturerId, ownerId });
        throw new AppError("Invalid action. Must be 'approve' or 'reject'", 400);
    }

    // Verify course exists and user is the owner
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Sub-lecturer course missing", { courseId, ownerId });
        throw new AppError("Course not found", 404);
    }

    if (course.lecturerId.toString() !== ownerId) {
        logger.warn("Sub-lecturer unauthorized", { courseId, ownerId });
        throw new AppError("Only the course owner can manage sub-lecturer requests", 403);
    }

    // Find the pending request
    const request = await SubLecturer.findOne({
        courseId,
        lecturerId,
        status: "pending",
    });

    if (!request) {
        logger.warn("Sub-lecturer request missing", { courseId, lecturerId });
        throw new AppError("No pending request found for this lecturer", 404);
    }

    // Update status
    request.status = action === "approve" ? "approved" : "rejected";
    await request.save();

    logger.info("Sub-lecturer request updated", { courseId, lecturerId, status: request.status });
    return res.status(200).json({
        success: true,
        message: `Sub-lecturer request ${action === "approve" ? "approved" : "rejected"} successfully`,
        data: request,
    });
};

module.exports = asyncHandler(handleSubLecturerRequest);
