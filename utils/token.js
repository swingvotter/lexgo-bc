const jwt = require("jsonwebtoken");

const generateAccessToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  return token;
};

const generateRefreshToken = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.Refresh_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return token;
};

module.exports = { generateAccessToken, generateRefreshToken };
