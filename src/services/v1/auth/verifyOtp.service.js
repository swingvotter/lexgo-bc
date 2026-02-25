const bcrypt = require("bcrypt");
const path = require('../../../path');
const User = require(path.models.users.user);
const AppError = require(path.error.appError);

const verifyOtp = async ({ otpCode, token }) => {
  if (!otpCode) {
    throw new AppError("OTP code is required", 400);
  }
  if (!token) {
    throw new AppError("Session token is missing", 400);
  }

  const user = await User.findOne({ "passwordReset.token": token });
  if (!user) {
    throw new AppError("invalid token.", 400);
  }

  const { otpExpiry, tokenExpiry, otp: dbOtp } = user.passwordReset;

  if (Date.now() > otpExpiry || Date.now() > tokenExpiry) {
    throw new AppError("OTP has expired.", 400);
  }

  if (!dbOtp) {
    throw new AppError("No OTP found for this session.", 400);
  }

  const isTokenMatch = await bcrypt.compare(String(otpCode), String(dbOtp));
  if (!isTokenMatch) {
    throw new AppError("Invalid OTP code. Please try again.", 400);
  }

  user.passwordReset.isVerified = true;
  await user.save();

  return user;
};

module.exports = { verifyOtp };
