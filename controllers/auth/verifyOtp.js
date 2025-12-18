const User = require("../../models/user.Model");
const bcrypt = require("bcrypt");

const otpVerificationHandler = async (req, res) => {
  try {
    
    const { otpCode } = req.body;

    const token = req.cookies.otpCodeToken;
    
    const user = await User.findOne({ "passwordReset.token":token });

    if (!user) {
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
      return res.status(400).json({
        success: false,
        message: "all fields is required",
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "token is missing",
      });
    }


    if (Date.now() > otpExpiry || Date.now() > tokenExpiry) {
      return res.status(400).json({
        success: false,
        message: "otp expired.",
      });
    }

    const isTokenMatch = await bcrypt.compare(otpCode, dbOtp);

    if (!isTokenMatch) {
      return res.status(400).json({
        success: false,
        message: "invalid token do not match.",
      });
    }

    user.passwordReset.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "otp succesfully verified",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `error:: ${error.message}` });
  }
};

module.exports = otpVerificationHandler;
