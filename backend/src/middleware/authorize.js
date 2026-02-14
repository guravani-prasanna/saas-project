// backend/src/middleware/authorize.js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({ success: false, message: 'Forbidden', data: null });
    }
    next();
  };
};

module.exports = authorize;
