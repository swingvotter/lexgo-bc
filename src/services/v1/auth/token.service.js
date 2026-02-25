const jwt = require("jsonwebtoken");
const path = require("../../../path");
const User = require(path.models.users.user);
const { generateAccessToken, generateRefreshToken } = require(path.utils.token);
const AppError = require(path.error.appError);

const rotateRefreshToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("refreshToken is missing", 401);
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.refreshToken !== refreshToken) {
    throw new AppError("refreshToken does not exist", 403);
  }

  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  return { user, newAccessToken, newRefreshToken };
};

module.exports = { rotateRefreshToken };
