const path = require('../../../../path');
const AiHistory = require(path.models.users.aiHistory);
const User = require(path.models.users.user);
const cursorPagination = require(path.utils.cursorPagination);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get AI chat history
 * 
 * @route GET /api/user/ai/history
 * @access Private - Requires authentication
 * 
 * @description Retrieves a paginated list of the user's past interactions
 * with the AI, sorted by most recent first.
 * 
 * @param {number} [req.query.page=1] - Page number
 * @param {number} [req.query.limit=20] - Number of items per page
 * @returns {Object} Paginated list of AI history entries
 */
async function getAiHistoryHandler(req, res) {
  const userId = req.userInfo.id;

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    logger.warn("AI history user missing", { userId });
    throw new AppError("User not found", 404);
  }

  const result = await cursorPagination({
    model: AiHistory,
    filter: { userId },
    limit: Number(req.query.limit || 25),
    cursor: req.query.cursor || null,
    projection: {},
    sort: { _id: -1 },
  });

  logger.info("AI history fetched", {
    userId,
    limit: Number(req.query.limit || 25),
    cursor: req.query.cursor || null,
    count: result.data.length,
  });

  return res.status(200).json({
    success: true,
    message: "AI history fetched successfully",
    aiHistory: result.data,
    nextCursor: result.nextCursor,
    hasMore: result.hasMore
  });
}

module.exports = asyncHandler(getAiHistoryHandler);
