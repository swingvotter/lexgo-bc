const path = require('../../../path');
const Enrollment = require(path.models.users.enrollment);
const Course = require(path.models.lecturer.course);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

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
    const { courseId } = req.params;
    const { courseCode } = req.body || {};
    const userId = req.userInfo.id; // Get student ID from auth middleware

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        logger.warn("Enrollment invalid course", { courseId, userId });
        throw new AppError("Invalid course ID", 400);
    }

    if (!courseCode) {
        logger.warn("Enrollment missing code", { courseId, userId });
        throw new AppError("Course code is required", 400);
    }

    // Verify the course exists
    const course = await Course.findById(courseId);
    if (!course) {
        logger.warn("Enrollment course missing", { courseId, userId });
        throw new AppError("Course not found", 404);
    }

    // Verify course code matches
    if (course.courseCode !== courseCode) {
        logger.warn("Enrollment invalid code", { courseId, userId });
        throw new AppError("Invalid course code", 400);
    }

    // Check if user already has an enrollment (any status) for this course
    // This prevents duplicate pending, approved, or rejected enrollments
    const existingEnrollment = await Enrollment.findOne({
        userId,
        course: courseId,
    });

    if (existingEnrollment) {
        logger.warn("Enrollment exists", { courseId, userId, status: existingEnrollment.status });
        throw new AppError(`You already have a ${existingEnrollment.status} enrollment for this course`, 400);
    }

    // Create new enrollment with pending status
    // Lecturer must approve before student can access course
    const enrollment = await Enrollment.create({
        userId,
        course: courseId,
        status: "pending",
    });

    logger.info("Enrollment requested", { courseId, userId, enrollmentId: enrollment?._id });
    return res.status(201).json({
        success: true,
        message: "Course application submitted successfully. Awaiting approval.",
        data: enrollment,
    });
};

module.exports = asyncHandler(applyToCourse);
