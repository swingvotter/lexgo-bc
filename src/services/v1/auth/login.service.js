const path = require('../../../path');
const User = require(path.models.users.user);
const bcrypt = require("bcrypt");
const { generateAccessToken, generateRefreshToken } = require(path.utils.token);
const updateLoginStreak = require(path.utils.streakUtils);
const AppError = require(path.error.appError);

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("wrong credentails", 401);
  }

  const passwordExist = await bcrypt.compare(password, user.password);

  if (!passwordExist) {
    throw new AppError("wrong credentails", 401);
  }

  await updateLoginStreak(user);

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return { accessToken, refreshToken, user };
};

module.exports = { loginUser };
