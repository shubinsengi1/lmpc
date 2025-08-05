const express = require('express');
const { body } = require('express-validator');
const { authenticateToken, requireDriver } = require('../middleware/auth');
const {
  requestRide,
  acceptRide,
  updateRideStatus,
  getUserRides,
  getDriverRides,
  rateRide
} = require('../controllers/ridesController');

const router = express.Router();

// Validation rules
const requestRideValidation = [
  body('pickupLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
  body('pickupLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
  body('pickupAddress').trim().isLength({ min: 1 }).withMessage('Pickup address is required'),
  body('destinationLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid destination latitude'),
  body('destinationLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid destination longitude'),
  body('destinationAddress').trim().isLength({ min: 1 }).withMessage('Destination address is required'),
  body('distance').isFloat({ min: 0 }).withMessage('Invalid distance'),
  body('duration').optional().isInt({ min: 0 }).withMessage('Invalid duration')
];

const updateRideStatusValidation = [
  body('status').isIn(['arrived', 'started', 'completed', 'cancelled']).withMessage('Invalid status')
];

const rateRideValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().trim().isLength({ max: 500 }).withMessage('Feedback too long')
];

// Routes
router.post('/request', authenticateToken, requestRideValidation, requestRide);
router.post('/:rideId/accept', authenticateToken, requireDriver, acceptRide);
router.put('/:rideId/status', authenticateToken, updateRideStatusValidation, updateRideStatus);
router.get('/user', authenticateToken, getUserRides);
router.get('/driver', authenticateToken, requireDriver, getDriverRides);
router.post('/:rideId/rate', authenticateToken, rateRideValidation, rateRide);

module.exports = router;