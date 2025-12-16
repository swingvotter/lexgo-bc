const User = require("../../models/user.Model");
const { safeVerifyToken } = require("../../utils/token");

const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const decoded = safeVerifyToken(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      if (decoded) {
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
