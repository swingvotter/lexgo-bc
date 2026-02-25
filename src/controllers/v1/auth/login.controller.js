const path = require('../../../path');
const { loginUser: loginUserService } = require(path.services.v1.auth.login);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);

const loginUser = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    logger.warn("Login attempt with missing fields", { email: email || "missing" });
    return res.status(400).json({ success: false, message: "invalid fields", doc: "make sure all fields are correctly spelt and included" });
  }

  const { accessToken, refreshToken, user } = await loginUserService({ email, password });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000 // 15 Minutes
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
  })

  logger.info("User logged in successfully", { userId: user._id, email, role: user.role });

  return res.status(200).json({
    success: true,
    message: "user login successfully",
  });
};

module.exports = asyncHandler(loginUser);
