const path = require('../../../path');
const User = require(path.models.users.user);
const sendMail = require(path.utils.mailSender);
const { otpHasher } = require(path.utils.hashing);
const otpGenerator = require(path.utils.otpGenerator);
const crypto = require("crypto");
const AppError = require(path.error.appError);

const sendOtp = async (email) => {
  if (!email) {
    throw new AppError("All fields are required", 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("If an account exists, an OTP has been sent.", 400);
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  const subject = "OTP Verification - LexGo";
  const otp = otpGenerator();
  const content = `Your verification code is ${otp}. Valid for 15 minutes.`;
  const otpHash = await otpHasher(otp);

  // fire and forget
  sendMail(email, subject, content, otp).catch(() => {});

  user.passwordReset.otp = otpHash;
  user.passwordReset.otpExpiry = Date.now() + 15 * 60 * 1000;
  user.passwordReset.token = hashedToken;
  user.passwordReset.tokenExpiry = Date.now() + 15 * 60 * 1000;

  await user.save();

  return { hashedToken };
};

module.exports = { sendOtp };
