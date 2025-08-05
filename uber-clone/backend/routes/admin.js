const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  verifyDriver,
  getAllRides,
  getAnalytics,
  getAdminLogs,
  createAdmin
} = require('../controllers/adminController');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Validation rules
const createAdminValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required')
];

const verifyDriverValidation = [
  body('verified').isBoolean().withMessage('Verified must be a boolean')
];

// Routes
router.get('/dashboard/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:userId/toggle-status', toggleUserStatus);
router.put('/drivers/:driverId/verify', verifyDriverValidation, verifyDriver);
router.get('/rides', getAllRides);
router.get('/analytics', getAnalytics);
router.get('/logs', getAdminLogs);
router.post('/create-admin', createAdminValidation, createAdmin);

module.exports = router;