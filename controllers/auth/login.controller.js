const path = require("../../path");
const User = require(path.models.users.user);
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { generateAccessToken, generateRefreshToken } = require(path.utils.token);
const updateLoginStreak = require(path.utils.streakUtils);
const logger = require(path.config.logger);

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      logger.warn("Login attempt with missing fields", { email: email || "missing" });
      return res.status(400).json({ success: false, message: "invalid fields", doc: "make sure all fields are correctly spelt and included" });
    }

    const user = await User.findOne({ email })

    if (!user) {
      logger.warn("Login attempt with non-existent email", { email });
      return res.status(401).json({ success: false, message: "wrong credentails", doc: "meaning user has not registred or wrong credentials" });
    }

    const passwordExist = await bcrypt.compare(password, user.password)

    if (!passwordExist) {
      logger.warn("Login attempt with incorrect password", { userId: user._id, email });
      return res.status(401).json({ success: false, message: "wrong credentails", doc: "meaning user has not registred or wrong credentials" });
    }

    await updateLoginStreak(user)

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000 // 15 Minutes
    })

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    })

    user.refreshToken = refreshToken
    await user.save()

    logger.info("User logged in successfully", { userId: user._id, email, role: user.role });

    return res.status(200).json({
      success: true,
      message: "user login successfully",
    });

  } catch (error) {
    logger.error("Login error", { error: error.message, stack: error.stack, email: req.body?.email });
    return res.status(500).json({ success: false, message: "error::server error" });
  }
};

module.exports = loginUser;
