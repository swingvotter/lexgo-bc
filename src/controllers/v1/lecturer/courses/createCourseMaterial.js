const path = require('../../../../path');
const ResourceContent = require(path.models.lecturer.resourceContent);
const Course = require(path.models.lecturer.course);
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const courseMaterialQueue = require(path.queues.v1.courseMaterial);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

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
  const courseId = req.params?.courseId;
  if (!courseId) {
    logger.warn("Course material missing course");
    throw new AppError("courseId is required", 400);
  }

  // Check if course materials already exist for this course
  const existingMaterial = await CourseMaterial.findOne({ courseId });
  if (existingMaterial) {
    logger.warn("Course material exists", { courseId, courseMaterialId: existingMaterial._id });
    throw new AppError("Course materials have already been created for this course. You can upload additional resources, but cannot regenerate course materials.", 409);
  }

  // Fetch all extracted text content from uploaded PDFs for this course
  const resourceContents = await ResourceContent.find({ courseId }).select(
    "content -_id"
  );

  if (!resourceContents || resourceContents.length === 0) {
    logger.warn("Course material no content", { courseId });
    throw new AppError("No resource content found. Please upload course materials (PDFs) before generating course content.", 400);
  }

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
      logger.warn("Course material course missing", { courseId });
      throw new AppError("course not found", 404);
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
  logger.info("Course material queued", { courseId, lecturerId, jobId: job.id });
  return res.status(202).json({
    success: true,
    message: "job created successfully",
    jobId: job.id,  // Client can poll with this ID
  });
};

module.exports = asyncHandler(createCourseMaterialHandler);

