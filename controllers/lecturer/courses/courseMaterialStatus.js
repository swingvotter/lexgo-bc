const courseMaterialQueue = require("../../../queues/courseMaterialQueue");
const CourseMaterial = require("../../../models/lecturer/courseMaterial");
const mongoose = require("mongoose");

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
  try {
    const { jobId } = req.params;
    const lecturerId = req.userInfo?.id;

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    if (!lecturerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Convert string ID to ObjectId for MongoDB query
    let lecturerObjectId = lecturerId;
    if (typeof lecturerId === "string" && mongoose.Types.ObjectId.isValid(lecturerId)) {
      lecturerObjectId = new mongoose.Types.ObjectId(lecturerId);
    }

    // Retrieve job from BullMQ queue
    const job = await courseMaterialQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Get current job state
    const state = await job.getState();
    const progress = job.progress;

    // Handle completed jobs - return the generated material
    if (state === "completed") {
      const returnValue = await job.returnvalue;
      const courseMaterialId = returnValue?.courseMaterialId;

      if (!courseMaterialId) {
        return res.status(500).json({ message: "CourseMaterial ID not found in job result" });
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
          return res.status(403).json({ message: "Access denied: CourseMaterial belongs to another lecturer" });
        }
        return res.status(404).json({ message: "CourseMaterial not found" });
      }

      return res.status(200).json({ status: "completed", courseMaterialId: courseMaterial._id, courseMaterial });
    }

    // Handle failed jobs - return the error
    if (state === "failed") {
      const failedReason = job.failedReason;
      return res.status(500).json({ status: "failed", message: failedReason || "Course material generation failed" });
    }

    // Job still in progress - return current state
    return res.status(200).json({ status: state, progress, message: "Course material generation in progress" });
  } catch (error) {
    console.error("Course material status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getCourseMaterialStatusHandler;

