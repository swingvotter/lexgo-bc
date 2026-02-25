const path = require("../path");
const User = require(path.models.users.user)

const lecturerMiddleware = async (req, res, next) => {
  try {
    // authMiddleware should run first to set req.userInfo
    if (!req.userInfo || !req.userInfo.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Option 2: Fetch user from DB to check role (less efficient but more secure)
    const user = await User.findById(req.userInfo.id).select("role");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "lecturer") {
      return res.status(403).json({
        success: false,
        message: "Access denied. lecturer privileges required."
      });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error"
    });
  }
};

module.exports = lecturerMiddleware;