const path = require("../../../path");
const User = require(path.models.users.user);
const { passwordHasher } = require(path.utils.hashing);
const AppError = require(path.error.appError);

const resetPassword = async ({ password, confirmPassword, token }) => {
  if (!password || !confirmPassword) {
    throw new AppError("All fields are required", 400);
  }

  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", 400);
  }

  const user = await User.findOne({ "passwordReset.token": token });

  if (!user) {
    throw new AppError("user not found", 404);
  }

  if (!user.passwordReset.isVerified) {
    throw new AppError("user is not verified", 401);
  }

  const hashPassword = await passwordHasher(password);
  user.password = hashPassword;

  user.passwordReset.otp = null;
  user.passwordReset.otpExpiry = null;
  user.passwordReset.token = null;
  user.passwordReset.tokenExpiry = null;
  user.passwordReset.isVerified = false;

  await user.save();

  return user;
};

module.exports = { resetPassword };
