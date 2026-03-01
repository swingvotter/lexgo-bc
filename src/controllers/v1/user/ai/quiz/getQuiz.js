const path = require('../../../../../path');
const Quiz = require(path.models.users.quiz);
const mongoose = require("mongoose");
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const getQuizHandler = async (req, res) => {
  const { quizId } = req.params;
  const userId = req.userInfo.id;

  if (!quizId) {
    logger.warn("Quiz id missing", { userId });
    throw new AppError("quizId is required", 400);
  }

  let userIdObjectId = userId;
  if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
    userIdObjectId = new mongoose.Types.ObjectId(userId);
  }

  const quiz = await Quiz.findOne({
    _id: quizId,
    userId: userIdObjectId,
  });

  if (!quiz) {
    logger.warn("Quiz not found/denied", { quizId, userId: userIdObjectId });
    throw new AppError("Quiz not found or access denied", 404);
  }

  logger.info("Quiz retrieved", { quizId, userId: userIdObjectId });
  res.status(200).json({
    message: "Quiz retrieved successfully",
    quiz,
  });
};

module.exports = asyncHandler(getQuizHandler);




