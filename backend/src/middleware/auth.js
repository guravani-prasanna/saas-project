// backend/src/middleware/auth.js
const { verifyToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [, token] = header.split(' ');

  if (!token) {
    return res.status(401).json({ success: false, message: 'Missing token', data: null });
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.userId,
      tenantId: decoded.tenantId || null,
      role: decoded.role,
    };
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', data: null });
  }
};

module.exports = auth;
