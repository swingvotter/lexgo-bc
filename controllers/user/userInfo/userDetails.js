const User = require("../../../models/users/user.Model");

const fetchUserDetails = async (req, res) => {
  try {
    const userId = req.userInfo?.id;

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId)
      .select("-password -refreshToken -passwordReset -__v");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
};

module.exports = fetchUserDetails;
