const path = require('../../../path');
const Enrollment = require(path.models.users.enrollment);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Approve or reject a student's enrollment request
 * 
 * @route PATCH /api/Enrollments/requests/:courseId/:userId
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Allows a lecturer to approve or reject a pending enrollment
 * request. Only the course owner can manage enrollments. Approved students
 * will be able to access the course content.
 * 
 * @param {string} req.params.courseId - The course ID
 * @param {string} req.params.studentId - The student's user ID
 * @param {string} req.body.action - "approve" or "reject"
 * 
 * @returns {Object} The updated enrollment record
 */
const approveOrRejectEnrollment = async (req, res) => {
    const { courseId, userId } = req.params;
    const { action } = req.body || {};
    const lecturerId = req.userInfo.id; // Get lecturer ID from auth middleware

    if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
        logger.warn("Enrollment invalid ids", { courseId, userId, lecturerId });
        throw new AppError("Invalid course ID or student ID", 400);
    }

    // Validate the action parameter
    if (!action || !["approve", "reject"].includes(action)) {
        logger.warn("Enrollment invalid action", { action, courseId, userId, lecturerId });
        throw new AppError("Invalid action. Must be 'approve' or 'reject'", 400);
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Enrollment course missing", { courseId, lecturerId });
        throw new AppError("Course not found", 404);
    }

    // Authorization: Only the course owner can manage enrollments
    if (course.lecturerId.toString() !== lecturerId) {
        logger.warn("Enrollment not authorized", { courseId, lecturerId });
        throw new AppError("You are not authorized to manage enrollments for this course", 403);
    }

    // Find the pending enrollment for this specific student and course
    const enrollment = await Enrollment.findOne({
        userId,
        course: courseId,
        status: "pending",
    });

    if (!enrollment) {
        logger.warn("Enrollment pending missing", { courseId, userId, lecturerId });
        throw new AppError("No pending enrollment found for this student", 404);
    }

    // Update enrollment status
    enrollment.status = action === "approve" ? "approved" : "rejected";
    await enrollment.save();

    logger.info("Enrollment updated", { courseId, userId, status: enrollment.status });
    return res.status(200).json({
        success: true,
        message: `Enrollment ${action === "approve" ? "approved" : "rejected"} successfully`,
        data: enrollment,
    });
};

module.exports = asyncHandler(approveOrRejectEnrollment);
