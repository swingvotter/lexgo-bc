const User = require("../../models/user.Model");

const registerUser = async (req, res) => {
  try {

    console.log(`detectedC:::::${req.detectedCountry}`);

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
      role,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !university ||
      !acadamicLevel ||
      !program ||
      !email ||
      !studentId ||
      !password) {     
        return res.status(400).json({ success: true, message: "invalid fields",doc:"make sure all fields are correctly spelt and included" });
    }

    return res.status(201).json({ success: true, message: "good" });

  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

module.exports = registerUser;
