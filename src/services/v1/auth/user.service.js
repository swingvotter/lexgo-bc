const path = require("../../../path");
const User = require(path.models.users.user);

const findSafeUserById = async (userId) => {
  return User.findById(userId)
    .select("firstName lastName email phoneNumber university role createdAt");
};

module.exports = { findSafeUserById };
