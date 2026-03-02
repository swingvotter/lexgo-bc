const path = require('../../../../path');
const courseMaterialQueue = require(path.queues.v1.courseMaterial);
const CourseMaterial = require(path.models.lecturer.courseMaterial);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get the status of a course material generation job
 * 
 * @route GET /api/Courses/courseMaterial/status/:jobId
 * @access Private - Requires authentication (lecturer only)
 * 
 * @description Polls the status of a background AI job that generates
 * course materials. Returns the generated material when complete.
 * 
 * Job States:
 * - waiting: Job is in queue
 * - active: Job is being processed
 * - completed: Job finished successfully (returns material)
 * - failed: Job failed (returns error message)
 * 
 * @param {string} req.params.jobId - The job ID from createCourseMaterial
 * @returns {Object} Job status and material data (if completed)
 */
const getCourseMaterialStatusHandler = async (req, res) => {
  const { jobId } = req.params;
  const lecturerId = req.userInfo?.id;

  if (!jobId) {
    logger.warn("Course material missing job", { lecturerId });
    throw new AppError("jobId is required", 400);
  }

  if (!lecturerId) {
    logger.warn("Course material unauthorized");
    throw new AppError("Unauthorized", 401);
  }

  // Convert string ID to ObjectId for MongoDB query
  let lecturerObjectId = lecturerId;
  if (typeof lecturerId === "string" && mongoose.Types.ObjectId.isValid(lecturerId)) {
    lecturerObjectId = new mongoose.Types.ObjectId(lecturerId);
  }

  // Retrieve job from BullMQ queue
  const job = await courseMaterialQueue.getJob(jobId);

  if (!job) {
    logger.warn("Course material job missing", { jobId, lecturerId });
    throw new AppError("Job not found", 404);
  }

  // Get current job state
  const state = await job.getState();
  const progress = job.progress;

  // Handle completed jobs - return the generated material
  if (state === "completed") {
    const returnValue = await job.returnvalue;
    const courseMaterialId = returnValue?.courseMaterialId;

    if (!courseMaterialId) {
      logger.warn("Course material id missing", { jobId, lecturerId });
      throw new AppError("CourseMaterial ID not found in job result", 500);
    }

    // Verify the material belongs to this lecturer (authorization)
    const courseMaterial = await CourseMaterial.findOne({
      _id: courseMaterialId,
      lecturerId: lecturerObjectId,
    });

    if (!courseMaterial) {
      // Check if material exists but belongs to another lecturer
      const exists = await CourseMaterial.findOne({ _id: courseMaterialId });
      if (exists) {
        logger.warn("Course material unauthorized", { courseMaterialId, lecturerId });
        throw new AppError("Access denied: CourseMaterial belongs to another lecturer", 403);
      }
      logger.warn("Course material missing", { courseMaterialId, lecturerId });
      throw new AppError("CourseMaterial not found", 404);
    }

    logger.info("Course material completed", { courseMaterialId, lecturerId });
    return res.status(200).json({ status: "completed", courseMaterialId: courseMaterial._id, courseMaterial });
  }

  // Handle failed jobs - return the error
  if (state === "failed") {
    const failedReason = job.failedReason;
    logger.warn("Course material failed", { jobId, lecturerId });
    throw new AppError(failedReason || "Course material generation failed", 500);
  }

  // Job still in progress - return current state
  logger.info("Course material status", { jobId, state, lecturerId });
  return res.status(200).json({ status: state, progress, message: "Course material generation in progress" });
};

module.exports = asyncHandler(getCourseMaterialStatusHandler);

