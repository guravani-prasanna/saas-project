// backend/src/middleware/tenantIsolation.js
const tenantIsolation = (req, res, next) => {
  // For super_admin, allow cross-tenant operations when controller explicitly handles it
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }

  // For tenant-specific routes with :tenantId path param, enforce match
  if (req.params.tenantId && req.user?.tenantId) {
    if (req.params.tenantId !== req.user.tenantId) {
      return res.status(403).json({ success: false, message: 'Cross-tenant access forbidden', data: null });
    }
  }

  return next();
};

module.exports = tenantIsolation;
