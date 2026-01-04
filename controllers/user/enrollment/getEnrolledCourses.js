const Enrollment = require("../../../models/users/enrollment.Model");

/**
 * Get all approved courses for the authenticated user
 * GET /api/user/my-courses
 */
const getEnrolledCourses = async (req, res) => {
    try {
        const userId = req.userInfo.id; // from auth middleware

        // Find all approved enrollments for this user (note: schema uses "aproved")
        const enrollments = await Enrollment.find({
            userId,
            status: "aproved",
        }).populate("courses", "title courseCode category institution level description courseImageUrl");

        // Flatten courses from all enrollments
        const courses = enrollments.flatMap((enrollment) => enrollment.courses);

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
