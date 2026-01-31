const jwt = require("jsonwebtoken");
const path = require("../../path");
const User = require(path.models.users.user);
const { generateAccessToken, generateRefreshToken } = require(path.utils.token);
const logger = require(path.config.logger);

const refreshTokenRotation = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    logger.info(refreshToken);
    logger.console(refreshToken);

    if (!refreshToken) {
      logger.warn("Token refresh attempt with missing refreshToken");
      return res
        .status(401)
        .json({ success: false, message: "refreshToken is missing" });
    }

    const decodeToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodeToken.id);

    if (!user || user.refreshToken !== refreshToken) {
      logger.warn(
        "Token refresh attempt with invalid or mismatched refreshToken",
        { userId: decodeToken.id },
      );
      return res
        .status(403)
        .json({ success: false, message: "refreshToken does not exist" });
    }

    //TOKEN ROTATION

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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
  } catch (error) {
    logger.error("Token refresh error", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

module.exports = refreshTokenRotation;
