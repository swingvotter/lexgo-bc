const path = require("../../path");
const { resetPassword: resetPasswordService } = require(path.services.v1.auth.resetPassword);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);

const resetPassword = async (req, res) => {
  const { password, confirmPassword } = req.body || {};
  const token = req.cookies.otpCodeToken;

  const user = await resetPasswordService({ password, confirmPassword, token });

  res.clearCookie("otpCodeToken");

  logger.info("Password reset successfully", { userId: user._id, email: user.email });

  return res.status(200).json({
    success: true,
    message: "password reset successfully",
  });
};

module.exports = asyncHandler(resetPassword);
