// middleware/authMiddleware.js
// This file PROTECTS routes that require login
// How it works: Frontend sends a token in the header → we verify it here

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ---- PROTECT MIDDLEWARE ----
// Use this on any route that requires login
// Example: router.get('/profile', protect, getProfile)
const protect = async (req, res, next) => {
  let token;

  // Check if token is in the Authorization header
  // Header format: "Bearer eyJhbGciOiJIUzI1..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Get just the token part

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user and attach to request (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      next(); // Move to the actual route handler
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found' });
  }
};

// ---- ROLE MIDDLEWARE ----
// Use after protect to restrict to specific roles
// Example: router.get('/admin-only', protect, role('admin'), handler)
const role = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Only ${roles.join(', ')} can access this.`
      });
    }
    next();
  };
};

module.exports = { protect, role };
