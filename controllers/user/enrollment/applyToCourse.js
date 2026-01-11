const Enrollment = require("../../../models/users/enrollment.Model");
const Course = require("../../../models/lecturer/courses.Model");

/**
 * Apply to a course
 * Creates a new enrollment with status "pending"
 * POST /api/user/apply/:courseId
 */
const applyToCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userInfo.id; // from auth middleware

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if user already has an enrollment for this course
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
