const User = require("../../models/user.Model");

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(req.body);
  } catch (error) {
    return res.status(500).json({ success: false, message: error });
  }
};

module.exports = loginUser;
