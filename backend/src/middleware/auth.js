/**
 * MindEase — Auth Middleware
 * Validates JWT access token from Authorization header.
 */

const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Protect — require valid JWT
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    // Attach user to request (without password)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired, please refresh' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

/**
 * AdminOnly — must be authenticated AND have role 'admin'
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Access denied: admins only' });
};

module.exports = { protect, adminOnly };
