const courseMaterialQueue = require("../../queues/courseMaterialQueue");
const CourseMaterial = require("../../models/lecturer/courseMaterial");
const mongoose = require("mongoose");

const getCourseMaterialStatusHandler = async (req, res) => {
  try {
    const { jobId } = req.params;
    const lecturerId = req.userInfo?.id; // from auth middleware

    if (!jobId) {
      return res.status(400).json({ message: "jobId is required" });
    }

    if (!lecturerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Ensure lecturerId is ObjectId for query
    let lecturerObjectId = lecturerId;
    if (typeof lecturerId === "string" && mongoose.Types.ObjectId.isValid(lecturerId)) {
      lecturerObjectId = new mongoose.Types.ObjectId(lecturerId);
    }

    // Get job from queue
    const job = await courseMaterialQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    const state = await job.getState();
    const progress = job.progress;

    if (state === "completed") {
      const returnValue = await job.returnvalue;
      const courseMaterialId = returnValue?.courseMaterialId;

      if (!courseMaterialId) {
        return res.status(500).json({ message: "CourseMaterial ID not found in job result" });
      }

      const courseMaterial = await CourseMaterial.findOne({
        _id: courseMaterialId,
        lecturerId: lecturerObjectId,
      });

      if (!courseMaterial) {
        const exists = await CourseMaterial.findOne({ _id: courseMaterialId });
        if (exists) {
          return res.status(403).json({ message: "Access denied: CourseMaterial belongs to another lecturer" });
        }
        return res.status(404).json({ message: "CourseMaterial not found" });
      }

      return res.status(200).json({ status: "completed", courseMaterialId: courseMaterial._id, courseMaterial });
    }

    if (state === "failed") {
      const failedReason = job.failedReason;
      return res.status(500).json({ status: "failed", message: failedReason || "Course material generation failed" });
    }

    return res.status(200).json({ status: state, progress, message: "Course material generation in progress" });
  } catch (error) {
    console.error("Course material status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getCourseMaterialStatusHandler;
