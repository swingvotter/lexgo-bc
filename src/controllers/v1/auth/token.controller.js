const path = require("../../path");
const { rotateRefreshToken } = require(path.services.v1.auth.token);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);

const refreshTokenRotation = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  const { user, newAccessToken, newRefreshToken } = await rotateRefreshToken(refreshToken);

  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  logger.info("Token refreshed successfully", {
    userId: user._id,
    email: user.email,
  });

  return res.status(200).json({
    success: true,
    message: "token refreshed successfully",
  });
};

module.exports = asyncHandler(refreshTokenRotation);
