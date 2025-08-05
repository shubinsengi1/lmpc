const { validationResult } = require('express-validator');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

// Calculate fare based on distance (simplified pricing)
const calculateFare = (distance) => {
  const baseFare = 2.50;
  const perKmRate = 1.20;
  return Math.round((baseFare + (distance * perKmRate)) * 100) / 100;
};

// Request a new ride
const requestRide = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickupLat,
      pickupLng,
      pickupAddress,
      destinationLat,
      destinationLng,
      destinationAddress,
      distance,
      duration
    } = req.body;

    const userId = req.user.id;
    const fare = calculateFare(distance);

    db.run(
      `INSERT INTO rides (userId, pickupLat, pickupLng, pickupAddress, 
       destinationLat, destinationLng, destinationAddress, distance, duration, fare)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, pickupLat, pickupLng, pickupAddress, destinationLat, destinationLng, 
       destinationAddress, distance, duration, fare],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create ride request' });
        }

        const rideId = this.lastID;

        // Get the created ride details
        db.get(
          'SELECT * FROM rides WHERE id = ?',
          [rideId],
          (err, ride) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to retrieve ride details' });
            }

            // Emit ride request to available drivers via Socket.IO
            req.io.emit('new-ride-request', {
              rideId: ride.id,
              pickup: { lat: ride.pickupLat, lng: ride.pickupLng, address: ride.pickupAddress },
              destination: { lat: ride.destinationLat, lng: ride.destinationLng, address: ride.destinationAddress },
              fare: ride.fare,
              distance: ride.distance
            });

            res.status(201).json({
              message: 'Ride requested successfully',
              ride
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept a ride (driver only)
const acceptRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    // Check if ride exists and is available
    db.get(
      'SELECT * FROM rides WHERE id = ? AND status = "requested"',
      [rideId],
      (err, ride) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!ride) {
          return res.status(404).json({ error: 'Ride not found or already accepted' });
        }

        // Update ride with driver
        db.run(
          'UPDATE rides SET driverId = ?, status = "accepted", updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [driverId, rideId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to accept ride' });
            }

            // Get driver details
            db.get(
              `SELECT u.firstName, u.lastName, u.phone, u.rating, 
                      d.vehicleModel, d.vehiclePlate, d.vehicleColor 
               FROM users u 
               JOIN drivers d ON u.id = d.userId 
               WHERE u.id = ?`,
              [driverId],
              (err, driver) => {
                if (err) {
                  return res.status(500).json({ error: 'Failed to get driver details' });
                }

                // Notify user that ride was accepted
                req.io.to(`user_${ride.userId}`).emit('ride-accepted', {
                  rideId,
                  driver: {
                    name: `${driver.firstName} ${driver.lastName}`,
                    phone: driver.phone,
                    rating: driver.rating,
                    vehicle: `${driver.vehicleColor} ${driver.vehicleModel}`,
                    plate: driver.vehiclePlate
                  }
                });

                res.json({ message: 'Ride accepted successfully' });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Update ride status
const updateRideStatus = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = ['arrived', 'started', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get ride details
    db.get(
      'SELECT * FROM rides WHERE id = ? AND (userId = ? OR driverId = ?)',
      [rideId, userId, userId],
      (err, ride) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!ride) {
          return res.status(404).json({ error: 'Ride not found or access denied' });
        }

        // Update ride status
        db.run(
          'UPDATE rides SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
          [status, rideId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update ride status' });
            }

            // Notify relevant parties
            req.io.to(`user_${ride.userId}`).emit('ride-status-updated', {
              rideId,
              status
            });

            if (ride.driverId) {
              req.io.to(`driver_${ride.driverId}`).emit('ride-status-updated', {
                rideId,
                status
              });
            }

            // If ride is completed, update user's total rides
            if (status === 'completed') {
              db.run(
                'UPDATE users SET totalRides = totalRides + 1 WHERE id = ?',
                [ride.userId]
              );
            }

            res.json({ message: `Ride status updated to ${status}` });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's rides
const getUserRides = (req, res) => {
  const userId = req.user.id;
  const { status, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT r.*, 
           u.firstName as driverFirstName, u.lastName as driverLastName, u.phone as driverPhone,
           d.vehicleModel, d.vehiclePlate, d.vehicleColor
    FROM rides r
    LEFT JOIN users u ON r.driverId = u.id
    LEFT JOIN drivers d ON r.driverId = d.userId
    WHERE r.userId = ?
  `;
  
  const params = [userId];

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rides) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ rides });
  });
};

// Get driver's rides
const getDriverRides = (req, res) => {
  const driverId = req.user.id;
  const { status, limit = 20, offset = 0 } = req.query;

  let query = `
    SELECT r.*, 
           u.firstName as userFirstName, u.lastName as userLastName, u.phone as userPhone
    FROM rides r
    JOIN users u ON r.userId = u.id
    WHERE r.driverId = ?
  `;
  
  const params = [driverId];

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  query += ' ORDER BY r.createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rides) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    res.json({ rides });
  });
};

// Rate a ride
const rateRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { rating, feedback } = req.body;
    const userId = req.user.id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if user can rate this ride
    db.get(
      'SELECT * FROM rides WHERE id = ? AND userId = ? AND status = "completed"',
      [rideId, userId],
      (err, ride) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!ride) {
          return res.status(404).json({ error: 'Ride not found or cannot be rated' });
        }

        if (ride.rating) {
          return res.status(400).json({ error: 'Ride already rated' });
        }

        // Update ride with rating
        db.run(
          'UPDATE rides SET rating = ?, feedback = ? WHERE id = ?',
          [rating, feedback, rideId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to save rating' });
            }

            // Update driver's average rating
            if (ride.driverId) {
              db.get(
                'SELECT AVG(rating) as avgRating FROM rides WHERE driverId = ? AND rating IS NOT NULL',
                [ride.driverId],
                (err, result) => {
                  if (!err && result.avgRating) {
                    db.run(
                      'UPDATE users SET rating = ? WHERE id = ?',
                      [Math.round(result.avgRating * 10) / 10, ride.driverId]
                    );
                  }
                }
              );
            }

            res.json({ message: 'Ride rated successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  requestRide,
  acceptRide,
  updateRideStatus,
  getUserRides,
  getDriverRides,
  rateRide
};