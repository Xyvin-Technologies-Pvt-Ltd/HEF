const jwt = require("jsonwebtoken");

exports.generateToken = (userId, roleId) => {
  const payload = {
    userId,
    ...(roleId && { roleId }),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {});
};
