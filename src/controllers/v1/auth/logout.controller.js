const path = require('../../../path');
const User = require(path.models.users.user);
const jwt = require("jsonwebtoken");
const { safeVerifyToken } = require(path.utils.token);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);

const logoutUser = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
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
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

module.exports = asyncHandler(logoutUser);
