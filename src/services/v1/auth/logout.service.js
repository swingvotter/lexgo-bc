const path = require("../../../path");
const User = require(path.models.users.user);

const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  const decoded = refreshToken ? require("jsonwebtoken").decode(refreshToken) : null;
  if (decoded?.id) {
    await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
  }
};

module.exports = { logoutUser };
