const path = require("../../path");
const User = require(path.models.users.user);
const jwt = require("jsonwebtoken");
const { safeVerifyToken } = require(path.utils.token);
const logger = require(path.config.logger);

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Decode the token regardless of expiry to get the user ID for cleanup
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, {
          refreshToken: null,
        });
        logger.info("User logged out successfully", { userId: decoded.id });
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
      ;
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error", { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = logoutUser;
