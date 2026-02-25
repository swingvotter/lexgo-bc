const path = require("../../path");
const Enrollment = require(path.models.users.enrollment);
const Course = require(path.models.lecturer.course);
const getPagination = require(path.utils.pagination);


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

        const { page, limit, skip } = getPagination(req.query);

        const filter = {
            userId,
            status: "approved",
        };

        // Query enrollments with approved status and pagination
        const [enrollments, total] = await Promise.all([
            Enrollment.find(filter)
                .populate("course", "title courseCode category institution level description courseImageUrl")
                .skip(skip)
                .limit(limit)
                .lean(),
            Enrollment.countDocuments(filter)
        ]);

        // Map enrollments to return just the course objects
        const courses = enrollments.map((enrollment) => enrollment.course);

        const pagination = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };

        return res.status(200).json({
            success: true,
            message: "Enrolled courses fetched successfully",
            data: courses,
            pagination
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
