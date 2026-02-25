const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // Check for token in cookies OR Authorization header
    const token =
      req.cookies?.accessToken ||
      (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : null);

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication token is missing" });
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.userInfo = decodeToken;



    next();
  } catch (error) {
    // Token invalid or expired
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
    return res
      .status(500)
      .json({ success: false, message: `Middleware error: ${error.message}` });
  }
};

module.exports = authMiddleware;
