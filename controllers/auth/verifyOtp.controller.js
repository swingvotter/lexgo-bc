const path = require("../../path");
const User = require(path.models.users.user);
const bcrypt = require("bcrypt");
const logger = require(path.config.logger);

const otpVerificationHandler = async (req, res) => {
  try {

    const { otpCode } = req.body || {};

    const token = req.cookies.otpCodeToken;

    const user = await User.findOne({ "passwordReset.token": token });

    if (!user) {
      logger.warn("OTP verification attempt with invalid token");
      return res.status(400).json({
        success: false,
        message: "invalid token.",
      });
    }

    const otpExpiry = user.passwordReset.otpExpiry;
    const tokenExpiry = user.passwordReset.tokenExpiry;
    const dbOtp = user.passwordReset.otp;
    const dbToken = user.passwordReset.token;

    if (!otpCode) {
      logger.warn("OTP verification attempt with missing OTP code", { userId: user._id });
      return res.status(400).json({
        success: false,
        message: "OTP code is required",
      });
    }

    if (!token) {
      logger.warn("OTP verification attempt with missing session token");
      return res.status(400).json({
        success: false,
        message: "Session token is missing",
      });
    }

    if (Date.now() > otpExpiry || Date.now() > tokenExpiry) {
      logger.warn("OTP verification attempt with expired OTP", { userId: user._id });
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    if (!dbOtp) {
      logger.warn("OTP verification attempt with no OTP in session", { userId: user._id });
      return res.status(400).json({
        success: false,
        message: "No OTP found for this session.",
      });
    }

    // Ensure both inputs are strings to prevent bcrypt error
    const isTokenMatch = await bcrypt.compare(String(otpCode), String(dbOtp));

    if (!isTokenMatch) {
      logger.warn("OTP verification failed - incorrect OTP", { userId: user._id });
      return res.status(400).json({
        success: false,
        message: "Invalid OTP code. Please try again.",
      });
    }

    user.passwordReset.isVerified = true;
    await user.save();

    logger.info("OTP verified successfully", { userId: user._id, email: user.email });

    return res.status(200).json({
      success: true,
      message: "otp succesfully verified",
    });
  } catch (error) {
    logger.error("OTP verification error", { error: error.message, stack: error.stack });
    return res
      .status(500)
      .json({ success: false, message: `error:: ${error.message}` });
  }
};

module.exports = otpVerificationHandler;
