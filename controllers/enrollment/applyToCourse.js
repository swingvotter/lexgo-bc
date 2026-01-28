const Enrollment = require("../../models/users/enrollment.Model");
const Course = require("../../models/lecturer/courses.Model");
const mongoose = require("mongoose");

/**
 * Apply to enroll in a course
 * 
 * @route POST /api/Enrollments/apply/:courseId
 * @access Private - Requires authentication (student)
 * 
 * @description Creates a new enrollment request with "pending" status.
 * The lecturer must approve the enrollment before the student can access
 * the course content. Prevents duplicate enrollment requests.
 * 
 * @param {string} req.params.courseId - The course ID to apply for
 * @param {string} req.body.courseCode - The unique code of the course (verification)
 * @returns {Object} The created enrollment record
 */
const applyToCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { courseCode } = req.body || {};
        const userId = req.userInfo.id; // Get student ID from auth middleware

        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID",
            });
        }

        if (!courseCode) {
            return res.status(400).json({
                success: false,
                message: "Course code is required",
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

        // Verify course code matches
        if (course.courseCode !== courseCode) {
            return res.status(400).json({
                success: false,
                message: "Invalid course code",
            });
        }

        // Check if user already has an enrollment (any status) for this course
        // This prevents duplicate pending, approved, or rejected enrollments
        const existingEnrollment = await Enrollment.findOne({
            userId,
            course: courseId,
        });

        if (existingEnrollment) {
            return res.status(400).json({
                success: false,
                message: `You already have a ${existingEnrollment.status} enrollment for this course`,
            });
        }

        // Create new enrollment with pending status
        // Lecturer must approve before student can access course
        const enrollment = await Enrollment.create({
            userId,
            course: courseId,
            status: "pending",
        });

        return res.status(201).json({
            success: true,
            message: "Course application submitted successfully. Awaiting approval.",
            data: enrollment,
        });
    } catch (error) {
        console.error("Apply to course error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

module.exports = applyToCourse;
