const path = require('../../../../../path');
const Quiz = require(path.models.users.quiz);
const mongoose = require("mongoose");
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);


const getQuizzesHandler = async (req, res) => {
    const userId = req.userInfo?.id;
    if (!userId) {
      logger.warn("Quiz list unauthorized", { userId: null });
      throw new AppError("Authentication required", 401);
    }

    let userIdObjectId = userId;
    if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
      userIdObjectId = new mongoose.Types.ObjectId(userId);
    }

    const query = { userId: userIdObjectId };

    if (req.query.completed !== undefined) {
      query.completed = req.query.completed === 'true';
    }

    if (req.query.difficultyLevel) {
      const allowedLevels = ["easy", "medium", "hard"];
      if (allowedLevels.includes(req.query.difficultyLevel)) {
        query.difficultyLevel = req.query.difficultyLevel;
      }
    }

    const result = await cursorPagination({
      model: Quiz,
      filter: query,
      limit: Number(req.query.limit || 25),
      cursor: req.query.cursor || null,
      projection: {},
      sort: { _id: -1 }
    });

    logger.info("Quizzes retrieved", {
      userId: userIdObjectId,
      limit: Number(req.query.limit || 25),
      cursor: req.query.cursor || null,
      count: result.data.length,
    });

    res.status(200).json({
      message: "Quizzes retrieved successfully",
      quizzes: result.data,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    });
};

module.exports = asyncHandler(getQuizzesHandler);
