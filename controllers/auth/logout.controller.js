const path = require("../../path");
const User = require(path.models.users.user);
const jwt = require("jsonwebtoken");
const { safeVerifyToken } = require(path.utils.token);

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // Decode the token regardless of expiry to get the user ID for cleanup
      const decoded = jwt.decode(refreshToken);

      if (decoded && decoded.id) {
        await User.findByIdAndUpdate(decoded.id, {
          refreshToken: null,
        });
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })
      ;
    res.clearCookie("accessToken", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = logoutUser;
