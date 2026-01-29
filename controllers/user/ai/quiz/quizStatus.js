const path = require("../../../../path");
const quizQueue = require(path.queues.quiz);
const Quiz = require(path.models.users.quiz);
const mongoose = require("mongoose");

const getQuizStatusHandler = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userInfo.id; // from auth middleware

    // Ensure userId is ObjectId for query
    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }

    if (!jobId) {
      return res.status(400).json({
        message: "jobId is required",
      });
    }

    // Get job from queue
    const job = await quizQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    // Get job state
    const state = await job.getState();
    const progress = job.progress;

    // If job is completed, get the quiz
    if (state === "completed") {
      const returnValue = await job.returnvalue;
      const quizId = returnValue?.quizId;

      if (!quizId) {
        return res.status(500).json({
          message: "Quiz ID not found in job result",
        });
      }

      // Fetch the quiz and verify it belongs to the user
      const quiz = await Quiz.findOne({
        _id: quizId,
        userId: userIdObjectId,
      });

      if (!quiz) {
        // Check if quiz exists but belongs to different user
        const quizExists = await Quiz.findOne({ _id: quizId });
        if (quizExists) {
          return res.status(403).json({
            message: "Access denied: Quiz belongs to another user",
          });
        }
        return res.status(404).json({
          message: "Quiz not found",
        });
      }

      return res.status(200).json({
        status: "completed",
        quizId: quiz._id,
        quiz: quiz,
      });
    }

    // If job failed, return error
    if (state === "failed") {
      const failedReason = job.failedReason;
      return res.status(500).json({
        status: "failed",
        message: failedReason || "Quiz generation failed",
      });
    }

    // Job is still processing
    res.status(200).json({
      status: state,
      progress: progress,
      message: "Quiz generation in progress",
    });
  } catch (error) {
    console.error("Quiz status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = getQuizStatusHandler;

