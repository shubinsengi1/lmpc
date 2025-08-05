const jwt = require('jsonwebtoken');
const db = require('../config/database');
require('dotenv').config();

// Verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Get user details from database
    db.get(
      'SELECT id, email, firstName, lastName, userType, isActive FROM users WHERE id = ?',
      [decoded.userId],
      (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user || !user.isActive) {
          return res.status(403).json({ error: 'User not found or inactive' });
        }

        req.user = user;
        next();
      }
    );
  });
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Check if user is driver
const requireDriver = (req, res, next) => {
  if (req.user.userType !== 'driver') {
    return res.status(403).json({ error: 'Driver access required' });
  }
  next();
};

// Check if user is driver or admin
const requireDriverOrAdmin = (req, res, next) => {
  if (req.user.userType !== 'driver' && req.user.userType !== 'admin') {
    return res.status(403).json({ error: 'Driver or Admin access required' });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireDriver,
  requireDriverOrAdmin
};