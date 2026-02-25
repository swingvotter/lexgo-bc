const path = require('../../../path');
const User = require(path.models.users.user);
const bcrypt = require("bcrypt");
const { findSafeUserById } = require("./user.service");
const AppError = require("../../../error/appError");

/**
 * Create a new user after validating duplicates and hashing password
 * @param {object} payload - validated body from controller
 * @returns {Promise<object>} safe user projection
 */
const registerUser = async (payload = {}) => {
  const { email, phoneNumber, password, ...rest } = payload;

  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Phone number";
      throw new AppError(`${field} is already registered with another account`, 400);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      ...rest,
      email,
      phoneNumber,
      password: hashPassword,
    });

    return findSafeUserById(user._id);
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      throw new AppError(`Duplicate value for ${field}`, 409);
    }
    throw error;
  }
};

module.exports = { registerUser };
