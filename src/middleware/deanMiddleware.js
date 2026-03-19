const path = require('../path');
const User = require(path.models.users.user);

const deanMiddleware = async (req, res, next) => {
  try {
    if (!req.userInfo || !req.userInfo.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const user = await User.findById(req.userInfo.id).select("role university");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.role !== "dean" && user.role !== "viceDean") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Dean or Vice Dean privileges required."
      });
    }

    req.userInfo.university = user.university;
    next();
  } catch (error) {
    console.error("Dean middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization error"
    });
  }
};

module.exports = deanMiddleware;
