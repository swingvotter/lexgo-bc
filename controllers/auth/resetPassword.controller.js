const path = require("../../path");
const User = require(path.models.users.user);
const { passwordHasher } = require(path.utils.hashing);
const logger = require(path.config.logger);

const resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body || {};

    if (!password || !confirmPassword) {
      logger.warn("Password reset attempt with missing fields");
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      logger.warn("Password reset attempt with mismatched passwords");
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const token = req.cookies.otpCodeToken

    const user = await User.findOne({ "passwordReset.token": token })

    if (!user) {
      logger.warn("Password reset attempt with invalid token");
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    if (!user.passwordReset.isVerified) {
      logger.warn("Password reset attempt without OTP verification", { userId: user._id });
      return res
        .status(401)
        .json({ success: false, message: "user is not verified" });
    }

    const hashPassword = await passwordHasher(password)
    user.password = hashPassword

    res.clearCookie("otpCodeToken");

    user.passwordReset.otp = null
    user.passwordReset.otpExpiry = null
    user.passwordReset.token = null
    user.passwordReset.tokenExpiry = null
    user.passwordReset.isVerified = false

    await user.save()

    logger.info("Password reset successfully", { userId: user._id, email: user.email });

    return res.status(200).json({
      success: true,
      message: "password reset successfully",
    });

  } catch (error) {
    logger.error("Password reset error", { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = resetPassword;
