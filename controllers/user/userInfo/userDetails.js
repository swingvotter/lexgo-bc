const path = require("../../../path");
const User = require(path.models.users.user);

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
  try {
    const userId = req.userInfo?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    // Fetch user details excluding sensitive fields
    const user = await User.findById(userId)
      .select("-password -refreshToken -passwordReset -__v");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

module.exports = fetchUserDetails;
