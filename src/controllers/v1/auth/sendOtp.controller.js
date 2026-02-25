const path = require("../../path");
const { sendOtp: sendOtpService } = require(path.services.v1.auth.sendOtp);
const logger = require(path.config.logger);
const asyncHandler = require(path.utils.asyncHandler);


const sendOtp = async (req, res) => {
  const { email } = req.body || {};

  const { hashedToken } = await sendOtpService(email);

  res.cookie("otpCodeToken", hashedToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  logger.info("OTP sent successfully", { email });

  return res.status(200).json({
    success: true,
    message: "If an account exists, an OTP has been sent.",
  });
};

module.exports = asyncHandler(sendOtp);
