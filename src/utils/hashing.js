const bcrypt = require("bcrypt");

const getSaltRounds = (envKey) => {
  const value = Number(process.env[envKey]);

  if (!value || Number.isNaN(value)) {
    throw new Error(`Invalid ${envKey} value`);
  }

  return value;
};

const otpHasher = async (otp) => {
  if (!otp) {
    throw new Error("OTP is required for hashing");
  }

  const saltRounds = getSaltRounds("HASHING_OTP_SALT");

  try {
    return await bcrypt.hash(String(otp), saltRounds);
  } catch (error) {
    console.error("Error hashing OTP:", error);
    throw error;
  }
};

const passwordHasher = async (password) => {
  if (!password) {
    throw new Error("Password is required for hashing");
  }

  const saltRounds = getSaltRounds("HASHING_PASSWORD_SALT");

  try {
    return await bcrypt.hash(String(password), saltRounds);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

module.exports = { otpHasher, passwordHasher };
