const path = require("../../path");
const User = require(path.models.users.user);
const sendMail = require(path.utils.mailSender);
const { otpHasher } = require(path.utils.hashing);
const otpGenerator = require(path.utils.otpGenerator);
const crypto = require("crypto");
const logger = require(path.config.logger);


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      logger.warn("OTP request with missing email");
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn("OTP request for non-existent email", { email });
      return res
        .status(400)
        .json({ success: false, message: "If an account exists, an OTP has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const subject = "OTP Verification - LexGo";
    const otp = otpGenerator();
    const content = `Your verification code is ${otp}. Valid for 15 minutes.`;
    const otpHash = await otpHasher(otp);

    // Fire and forget - don't block the response
    sendMail(email, subject, content, otp).catch(err => {
      logger.error("Email send failed", { error: err.message, email });
    });

    res.cookie("otpCodeToken", hashedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    user.passwordReset.otp = otpHash;
    user.passwordReset.otpExpiry = Date.now() + 15 * 60 * 1000;
    user.passwordReset.token = hashedToken;
    user.passwordReset.tokenExpiry = Date.now() + 15 * 60 * 1000;


    await user.save();

    logger.info("OTP sent successfully", { userId: user._id, email });

    return res.status(200).json({
      success: true,
      message: "If an account exists, an OTP has been sent.",
    });
  } catch (error) {
    logger.error("Send OTP error", { error: error.message, stack: error.stack, email: req.body?.email });
    return res
      .status(500)
      .json({ success: false, message: `error:: ${error.message}` });
  }
};

module.exports = sendOtp;
