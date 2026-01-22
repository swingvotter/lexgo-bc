const Course = require("../models/lecturer/courses.Model");
const SubLecturer = require("../models/lecturer/subLecturer");

/**
 * Check if a user has access to manage a course
 * 
 * @param {string} courseId - The course ID
 * @param {string} userId - The user ID to check
 * @returns {Object} { hasAccess: boolean, isOwner: boolean, course: object|null }
 */
const checkCourseAccess = async (courseId, userId) => {
    const course = await Course.findById(courseId);

    if (!course) {
        return { hasAccess: false, isOwner: false, course: null };
    }

    // Check if user is the course owner
    if (course.lecturerId.toString() === userId) {
        return { hasAccess: true, isOwner: true, course };
    }

    // Check if user is an approved sub-lecturer
    const subLecturer = await SubLecturer.findOne({
        courseId,
        lecturerId: userId,
        status: "approved",
    });

    if (subLecturer) {
        return { hasAccess: true, isOwner: false, course };
    }

    return { hasAccess: false, isOwner: false, course };
};

module.exports = checkCourseAccess;
