const User = require("../../models/users/user.Model");
const sendMail = require("../../utils/mailSender");
const { otpHasher } = require("../../utils/hashing");
const otpGenerator = require("../../utils/otpGenerator");
const crypto = require("crypto");


const sendOtp = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
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
    sendMail(email, subject, content, otp).catch(err =>
      console.error("Email send failed:", err.message)
    );

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

    return res.status(200).json({
      success: true,
      message: "If an account exists, an OTP has been sent.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `error:: ${error.message}` });
  }
};

module.exports = sendOtp;
