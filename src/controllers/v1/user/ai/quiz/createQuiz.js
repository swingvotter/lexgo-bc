const path = require("../../../../../path");
const quizQueue = require(path.queues.v1.quiz);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const generateQuizHandler = async (req, res) => {
  const { topic, difficultyLevel, numberOfQuiz } = req.body || {};
  const userId = req.userInfo.id; // from auth middleware

  if (!topic || !difficultyLevel || !numberOfQuiz) {
    logger.warn("Quiz create missing fields", { userId });
    throw new AppError("topic, difficultyLevel, and numberOfQuiz are required", 400);
  }

  const job = await quizQueue.add(
    "generate-quiz",
    {
      topic,
      difficultyLevel,
      numberOfQuiz,
      userId,
    },
    {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );

  logger.info("Quiz generation started", { userId, jobId: job.id });
  res.status(202).json({
    message: "Quiz generation started",
    jobId: job.id,
    status: "processing",
  });
};

module.exports = asyncHandler(generateQuizHandler);
