const path = require('../../../../../path');
const Quiz = require(path.models.users.quiz);
const User = require(path.models.users.user);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

const submitQuizScoresHandler = async (req, res) => {
  const { score } = req.body || {};
  const quizId = req.params.quizId;
  const userId = req.userInfo.id;

  if (!quizId || score === undefined) {
    logger.warn("Quiz score missing", { userId, quizId, score });
    throw new AppError("quizId and score are required", 400);
  }

  if (typeof score !== "number" || score < 0) {
    logger.warn("Quiz score invalid", { userId, quizId, score });
    throw new AppError("score must be a non-negative number", 400);
  }

  const quiz = await Quiz.findOne({ _id: quizId, userId });

  if (!quiz) {
    logger.warn("Quiz not found/denied", { userId, quizId });
    throw new AppError("Quiz not found or access denied", 404);
  }

  if (quiz.completed) {
    logger.warn("Quiz already done", { userId, quizId });
    throw new AppError("Quiz score has already been submitted for this quiz", 400);
  }

  if (score > quiz.totalQuestions) {
    logger.warn("Quiz score too high", { userId, quizId, score, totalQuestions: quiz.totalQuestions });
    throw new AppError(`score cannot exceed total questions (${quiz.totalQuestions})`, 400);
  }

  quiz.score = score;
  quiz.completed = true;
  await quiz.save();

  const allCompletedQuizzes = await Quiz.find({
    userId,
    completed: true,
  });

  const totalQuizzes = allCompletedQuizzes.length;
  const totalPercentageSum = allCompletedQuizzes.reduce((sum, q) => {
    return sum + (q.score / q.totalQuestions) * 100;
  }, 0);
  const averageScore = totalQuizzes > 0 ? Math.round((totalPercentageSum / totalQuizzes) * 100) / 100 : 0;

  await User.findByIdAndUpdate(userId, {
    "quizStatistics.studentGeneratedQuiz.totalQuizzes": totalQuizzes,
    "quizStatistics.studentGeneratedQuiz.averageScore": averageScore,
  });

  logger.info("Quiz score saved", { userId, quizId: quiz._id, score: quiz.score });
  res.status(200).json({
    message: "Quiz score submitted successfully",
    quiz: {
      quizId: quiz._id,
      score: quiz.score,
      totalQuizzes,
      averageScore,
    },
  });
};

module.exports = asyncHandler(submitQuizScoresHandler);

