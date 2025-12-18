const bcrypt = require("bcrypt");

const otpHasher = async (otp) => {
  try {
    const result = await bcrypt.hash(otp, Number(process.env.HASHING_OTP_SALT));

    return result;
  } catch (error) {
    console.log(error);
  }
};


const passwordHasher = async (password) => {
  try {
    const result = await bcrypt.hash(password, Number(process.env.HASHING_OTP_SALT));

    return result;
  } catch (error) {
    console.log(error);
  }
};

module.exports = { otpHasher, passwordHasher };
