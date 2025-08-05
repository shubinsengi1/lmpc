const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const db = require('../config/database');
require('dotenv').config();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone, userType = 'user' } = req.body;

    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        db.run(
          `INSERT INTO users (email, password, firstName, lastName, phone, userType) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [email, hashedPassword, firstName, lastName, phone, userType],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create user' });
            }

            const userId = this.lastID;
            const token = generateToken(userId);

            res.status(201).json({
              message: 'User registered successfully',
              token,
              user: {
                id: userId,
                email,
                firstName,
                lastName,
                phone,
                userType
              }
            });
          }
        );
      } catch (hashError) {
        res.status(500).json({ error: 'Failed to process password' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user by email
    db.get(
      'SELECT * FROM users WHERE email = ? AND isActive = 1',
      [email],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        try {
          // Check password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Generate token
          const token = generateToken(user.id);

          // Remove password from response
          const { password: _, ...userWithoutPassword } = user;

          res.json({
            message: 'Login successful',
            token,
            user: userWithoutPassword
          });
        } catch (compareError) {
          res.status(500).json({ error: 'Authentication failed' });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user profile
const getProfile = (req, res) => {
  db.get(
    'SELECT id, email, firstName, lastName, phone, userType, profileImage, rating, totalRides, createdAt FROM users WHERE id = ?',
    [req.user.id],
    (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    }
  );
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;
    const userId = req.user.id;

    db.run(
      'UPDATE users SET firstName = ?, lastName = ?, phone = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [firstName, lastName, phone, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile' });
        }

        res.json({ message: 'Profile updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    db.get('SELECT password FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      try {
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        db.run(
          'UPDATE users SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [hashedNewPassword, userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update password' });
            }

            res.json({ message: 'Password updated successfully' });
          }
        );
      } catch (error) {
        res.status(500).json({ error: 'Failed to process password' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};