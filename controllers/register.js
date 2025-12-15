const User = require("../models/user.Model");

const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      otherName,
      phoneNumber,
      university,
      acadamicLevel,
      program,
      email,
      studentId,
      password,
    } = req.body;

    console.log(req.body)
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

module.exports = registerUser