const Enrollment = require("../../models/users/enrollment.Model");

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
    try {
        const userId = req.userInfo.id; // Get student ID from auth middleware

        // Query enrollments with approved status
        const enrollments = await Enrollment.find({
            userId,
            status: "approved",
        }).populate("course", "title courseCode category institution level description courseImageUrl");

        // Map enrollments to return just the course objects
        const courses = enrollments.map((enrollment) => enrollment.course);

        return res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully",
            data: courses,
        });
    } catch (error) {
        console.error("Get enrolled courses error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = getEnrolledCourses;
