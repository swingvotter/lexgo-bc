const Enrollment = require("../../models/users/enrollment.Model");
const Course = require("../../models/lecturer/courses.Model");
const User = require("../../models/users/user.Model");
const mongoose = require("mongoose");


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
    try {
        const { courseId } = req.params;
        const lecturerId = req.userInfo.id; // Get lecturer ID from auth middleware

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
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

        // Authorization: Only the course owner can view enrollment requests
        if (course.lecturerId.toString() !== lecturerId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view enrollments for this course",
            });
        }

        // Fetch pending enrollments with student and course details
        const pendingEnrollments = await Enrollment.find({
            course: courseId,
            status: "pending",
        })
            .populate("userId", "email firstName lastName")   // Include student info
            .populate("course", "title courseCode"); // Include course info


        return res.status(200).json({
            success: true,
            message: "Pending enrollment requests fetched successfully",
            data: pendingEnrollments,
        });
    } catch (error) {
        console.error("Get pending requests error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = getPendingRequests;
