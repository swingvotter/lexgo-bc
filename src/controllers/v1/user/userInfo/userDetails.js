const path = require('../../../../path');
const User = require(path.models.users.user);
const AppError = require(path.error.appError);
const asyncHandler = require(path.utils.asyncHandler);
const logger = require(path.config.logger);

/**
 * Get details of the authenticated user
 * 
 * @route GET /api/user/info
 * @access Private - Requires authentication
 * 
 * @description Fetches the profile information for the currently logged-in user,
 * excluding sensitive data like password and refresh tokens.
 * 
 * @returns {Object} User profile object
 */
const fetchUserDetails = async (req, res) => {
  const userId = req.userInfo?.id;

  if (!userId) {
    logger.warn("User info unauthorized", { userId: null });
    throw new AppError("Unauthorized", 401);
  }

  // Fetch user details excluding sensitive fields
  const user = await User.findById(userId)
    .select("-password -refreshToken -passwordReset -__v");

  if (!user) {
    logger.warn("User not found", { userId });
    throw new AppError("User not found", 404);
  }

  logger.info("User info fetched", { userId });
  return res.status(200).json({
    success: true,
    user,
  });
};

module.exports = asyncHandler(fetchUserDetails);
