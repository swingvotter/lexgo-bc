const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return token;
};

const generateRefreshToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

const safeVerifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

module.exports = { generateAccessToken, generateRefreshToken, safeVerifyToken };
