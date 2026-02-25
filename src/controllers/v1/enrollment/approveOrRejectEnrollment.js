const path = require('../../../path');
const Enrollment = require(path.models.users.enrollment);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");

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
    try {
        const { courseId, userId } = req.params;
        const { action } = req.body || {};
        const lecturerId = req.userInfo.id; // Get lecturer ID from auth middleware

        if (!mongoose.Types.ObjectId.isValid(courseId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID or student ID",
            });
        }

        // Validate the action parameter
        if (!action || !["approve", "reject"].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Invalid action. Must be 'approve' or 'reject'",
            });
        }

        // Verify the course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        // Authorization: Only the course owner can manage enrollments
        if (course.lecturerId.toString() !== lecturerId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to manage enrollments for this course",
            });
        }

        // Find the pending enrollment for this specific student and course
        const enrollment = await Enrollment.findOne({
            userId,
            course: courseId,
            status: "pending",
        });

        if (!enrollment) {
            return res.status(404).json({
                success: false,
                message: "No pending enrollment found for this student",
            });
        }

        // Update enrollment status
        enrollment.status = action === "approve" ? "approved" : "rejected";
        await enrollment.save();

        return res.status(200).json({
            success: true,
            message: `Enrollment ${action === "approve" ? "approved" : "rejected"} successfully`,
            data: enrollment,
        });
    } catch (error) {
        console.error("Approve/reject enrollment error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = approveOrRejectEnrollment;
