const path = require("../../../path");
const ResourceContent = require(path.models.lecturer.resourceContent);
const Course = require(path.models.lecturer.course);
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const courseMaterialQueue = require(path.queues.courseMaterial);

/**
 * Create AI-generated course materials from uploaded resources
 * 
 * @route POST /api/Courses/courseMaterial/:courseId
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Combines all extracted PDF content from course resources
 * and queues an AI job to generate study materials (summaries, quizzes, etc.).
 * Returns a job ID that can be polled for status.
 * 
 * **IMPORTANT**: Course materials can only be created ONCE per course.
 * Lecturers can still upload resources multiple times, but AI material
 * generation is a one-time operation to prevent duplicate content.
 * 
 * @param {string} req.params.courseId - The course ID to generate materials for
 * @returns {Object} Job ID for tracking the background processing
 */
const createCourseMaterialHandler = async (req, res) => {
  try {
    const courseId = req.params?.courseId;
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    // Check if course materials already exist for this course
    const existingMaterial = await CourseMaterial.findOne({ courseId });
    if (existingMaterial) {
      return res.status(409).json({
        success: false,
        message: "Course materials have already been created for this course. You can upload additional resources, but cannot regenerate course materials.",
        courseMaterialId: existingMaterial._id
      });
    }

    // Fetch all extracted text content from uploaded PDFs for this course
    const resourceContents = await ResourceContent.find({ courseId }).select(
      "content -_id"
    );

    // Combine all PDF contents into a single string with delimiters
    // This merged content will be sent to AI for processing
    const allContentCombined = resourceContents
      .map((item) => item.content)
      .join("-----------new pdf-----------");

    // Get lecturer ID (required for ownership of generated materials)
    let lecturerId = req.userInfo?.id;
    if (!lecturerId) {
      // Fallback: use course owner as lecturerId if request not authenticated
      const course = await Course.findById(courseId).select("lecturerId");
      if (!course) {
        return res.status(404).json({ success: false, message: "course not found" });
      }
      lecturerId = course.lecturerId;
    }

    // Add job to BullMQ queue for background processing
    // This prevents request timeout for long-running AI operations
    const job = await courseMaterialQueue.add(
      "create-course-material",
      { courseId, lecturerId, combinedContent: allContentCombined },
      {
        attempts: 3,  // Retry up to 3 times on failure
        backoff: { type: "exponential", delay: 2000 }  // Wait before retries
      }
    );

    // Return 202 Accepted - job is queued, not yet complete
    return res.status(202).json({
      success: true,
      message: "job created successfully",
      jobId: job.id,  // Client can poll with this ID
    });
  } catch (error) {
    console.error("Get resource content error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = createCourseMaterialHandler;

