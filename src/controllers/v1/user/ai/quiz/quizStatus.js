const path = require('../../../../../path');
const quizQueue = require(path.queues.v1.quiz);
const Quiz = require(path.models.users.quiz);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getQuizStatusHandler = async (req, res) => {
  const { jobId } = req.params;
  const userId = req.userInfo.id; // from auth middleware

  // Ensure userId is ObjectId for query
  let userIdObjectId = userId;
  if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
    userIdObjectId = new mongoose.Types.ObjectId(userId);
  }

  if (!jobId) {
    logger.warn("Quiz status missing id", { userId });
    throw new AppError("jobId is required", 400);
  }

  // Get job from queue
  const job = await quizQueue.getJob(jobId);

  if (!job) {
    logger.warn("Quiz job missing", { jobId, userId });
    throw new AppError("Job not found", 404);
  }

  // Get job state
  const state = await job.getState();
  const progress = job.progress;

  // If job is completed, get the quiz
  if (state === "completed") {
    const returnValue = await job.returnvalue;
    const quizId = returnValue?.quizId;

    if (!quizId) {
      logger.warn("Quiz id missing", { jobId, userId });
      throw new AppError("Quiz ID not found in job result", 500);
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
        logger.warn("Quiz access denied", { quizId, userId: userIdObjectId });
        throw new AppError("Access denied: Quiz belongs to another user", 403);
      }
      logger.warn("Quiz not found", { quizId, userId: userIdObjectId });
      throw new AppError("Quiz not found", 404);
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
    logger.warn("Quiz failed", { jobId, userId, reason: failedReason });
    throw new AppError(failedReason || "Quiz generation failed", 500);
  }

  // Job is still processing
  logger.info("Quiz status", { jobId, userId, status: state, progress });
  res.status(200).json({
    status: state,
    progress: progress,
    message: "Quiz generation in progress",
  });
};

module.exports = asyncHandler(getQuizStatusHandler);

