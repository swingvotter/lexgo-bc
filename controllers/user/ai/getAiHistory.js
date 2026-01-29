const path = require("../../../path");
const AiHistory = require(path.models.users.aiHistory);
const User = require(path.models.users.user);
const getPagination = require(path.utils.pagination);

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
  try {
    const userId = req.userInfo.id;

    // Use centralized pagination utility
    const { page, limit, skip } = getPagination(req.query);

    // Check user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch history and total count in parallel
    const [history, total] = await Promise.all([
      AiHistory.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      AiHistory.countDocuments({ userId: userId }),
    ]);

    return res.status(200).json({
      success: true,
      message: "AI history fetched successfully",
      data: {
        history,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    console.error("Error in getAiHistory controller:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

module.exports = getAiHistoryHandler;
