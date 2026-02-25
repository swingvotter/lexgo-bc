const path = require("../../path");
const { verifyOtp: verifyOtpService } = require(path.services.v1.auth.verifyOtp);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);

const otpVerificationHandler = async (req, res) => {
  const { otpCode } = req.body || {};
  const token = req.cookies.otpCodeToken;

  const user = await verifyOtpService({ otpCode, token });

  logger.info("OTP verified successfully", { userId: user._id, email: user.email });

  return res.status(200).json({
    success: true,
    message: "otp succesfully verified",
  });
};

module.exports = asyncHandler(otpVerificationHandler);
