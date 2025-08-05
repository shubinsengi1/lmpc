const db = require('../config/database');
const bcrypt = require('bcrypt');

// Get dashboard statistics
const getDashboardStats = (req, res) => {
  const queries = [
    'SELECT COUNT(*) as totalUsers FROM users WHERE userType = "user"',
    'SELECT COUNT(*) as totalDrivers FROM users WHERE userType = "driver"',
    'SELECT COUNT(*) as totalRides FROM rides',
    'SELECT COUNT(*) as activeRides FROM rides WHERE status IN ("requested", "accepted", "started")',
    'SELECT SUM(fare) as totalRevenue FROM rides WHERE status = "completed"',
    'SELECT COUNT(*) as todayRides FROM rides WHERE DATE(createdAt) = DATE("now")'
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.get(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  )).then(results => {
    const stats = {
      totalUsers: results[0].totalUsers || 0,
      totalDrivers: results[1].totalDrivers || 0,
      totalRides: results[2].totalRides || 0,
      activeRides: results[3].activeRides || 0,
      totalRevenue: results[4].totalRevenue || 0,
      todayRides: results[5].todayRides || 0
    };

    res.json({ stats });
  }).catch(error => {
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  });
};

// Get all users with pagination
const getAllUsers = (req, res) => {
  const { page = 1, limit = 20, userType, search } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT u.id, u.email, u.firstName, u.lastName, u.phone, u.userType, 
           u.isActive, u.isVerified, u.rating, u.totalRides, u.createdAt,
           d.vehicleModel, d.vehiclePlate, d.isAvailable, d.documentsVerified
    FROM users u
    LEFT JOIN drivers d ON u.id = d.userId
    WHERE 1=1
  `;
  
  const params = [];

  if (userType) {
    query += ' AND u.userType = ?';
    params.push(userType);
  }

  if (search) {
    query += ' AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY u.createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
    const countParams = [];

    if (userType) {
      countQuery += ' AND u.userType = ?';
      countParams.push(userType);
    }

    if (search) {
      countQuery += ' AND (u.firstName LIKE ? OR u.lastName LIKE ? OR u.email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        users,
        pagination: {
          total: countResult.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
};

// Toggle user active status
const toggleUserStatus = (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;

  // Get current user status
  db.get('SELECT isActive, firstName, lastName FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = user.isActive ? 0 : 1;

    // Update user status
    db.run(
      'UPDATE users SET isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update user status' });
        }

        // Log admin action
        db.run(
          'INSERT INTO admin_logs (adminId, action, details, targetUserId) VALUES (?, ?, ?, ?)',
          [adminId, 'USER_STATUS_CHANGE', 
           `Changed status of ${user.firstName} ${user.lastName} to ${newStatus ? 'active' : 'inactive'}`,
           userId]
        );

        res.json({ 
          message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
          newStatus: newStatus === 1
        });
      }
    );
  });
};

// Verify driver documents
const verifyDriver = (req, res) => {
  const { driverId } = req.params;
  const { verified } = req.body;
  const adminId = req.user.id;

  // Check if driver exists
  db.get(
    'SELECT d.*, u.firstName, u.lastName FROM drivers d JOIN users u ON d.userId = u.id WHERE d.userId = ?',
    [driverId],
    (err, driver) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      // Update driver verification status
      db.run(
        'UPDATE drivers SET documentsVerified = ? WHERE userId = ?',
        [verified ? 1 : 0, driverId],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update driver verification' });
          }

          // Log admin action
          db.run(
            'INSERT INTO admin_logs (adminId, action, details, targetUserId) VALUES (?, ?, ?, ?)',
            [adminId, 'DRIVER_VERIFICATION', 
             `${verified ? 'Verified' : 'Unverified'} driver ${driver.firstName} ${driver.lastName}`,
             driverId]
          );

          res.json({ 
            message: `Driver ${verified ? 'verified' : 'unverified'} successfully`
          });
        }
      );
    }
  );
};

// Get all rides with details
const getAllRides = (req, res) => {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
  const offset = (page - 1) * limit;

  let query = `
    SELECT r.*, 
           u1.firstName as userFirstName, u1.lastName as userLastName, u1.email as userEmail,
           u2.firstName as driverFirstName, u2.lastName as driverLastName, u2.email as driverEmail,
           d.vehicleModel, d.vehiclePlate
    FROM rides r
    JOIN users u1 ON r.userId = u1.id
    LEFT JOIN users u2 ON r.driverId = u2.id
    LEFT JOIN drivers d ON r.driverId = d.userId
    WHERE 1=1
  `;
  
  const params = [];

  if (status) {
    query += ' AND r.status = ?';
    params.push(status);
  }

  if (dateFrom) {
    query += ' AND DATE(r.createdAt) >= ?';
    params.push(dateFrom);
  }

  if (dateTo) {
    query += ' AND DATE(r.createdAt) <= ?';
    params.push(dateTo);
  }

  query += ' ORDER BY r.createdAt DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, rides) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM rides r WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND r.status = ?';
      countParams.push(status);
    }

    if (dateFrom) {
      countQuery += ' AND DATE(r.createdAt) >= ?';
      countParams.push(dateFrom);
    }

    if (dateTo) {
      countQuery += ' AND DATE(r.createdAt) <= ?';
      countParams.push(dateTo);
    }

    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        rides,
        pagination: {
          total: countResult.total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(countResult.total / limit)
        }
      });
    });
  });
};

// Get analytics data
const getAnalytics = (req, res) => {
  const { period = '7days' } = req.query;

  let dateCondition = '';
  switch (period) {
    case '24hours':
      dateCondition = "DATE(createdAt) = DATE('now')";
      break;
    case '7days':
      dateCondition = "DATE(createdAt) >= DATE('now', '-7 days')";
      break;
    case '30days':
      dateCondition = "DATE(createdAt) >= DATE('now', '-30 days')";
      break;
    case '90days':
      dateCondition = "DATE(createdAt) >= DATE('now', '-90 days')";
      break;
    default:
      dateCondition = "DATE(createdAt) >= DATE('now', '-7 days')";
  }

  const queries = [
    // Rides by status
    `SELECT status, COUNT(*) as count FROM rides WHERE ${dateCondition} GROUP BY status`,
    // Daily ride counts
    `SELECT DATE(createdAt) as date, COUNT(*) as count FROM rides WHERE ${dateCondition} GROUP BY DATE(createdAt) ORDER BY date`,
    // Revenue by day
    `SELECT DATE(createdAt) as date, SUM(fare) as revenue FROM rides WHERE ${dateCondition} AND status = 'completed' GROUP BY DATE(createdAt) ORDER BY date`,
    // Top drivers by rides
    `SELECT u.firstName, u.lastName, COUNT(*) as rideCount, AVG(r.rating) as avgRating 
     FROM rides r 
     JOIN users u ON r.driverId = u.id 
     WHERE ${dateCondition} AND r.status = 'completed'
     GROUP BY r.driverId 
     ORDER BY rideCount DESC 
     LIMIT 10`
  ];

  Promise.all(queries.map(query => 
    new Promise((resolve, reject) => {
      db.all(query, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    })
  )).then(results => {
    const analytics = {
      ridesByStatus: results[0] || [],
      dailyRides: results[1] || [],
      dailyRevenue: results[2] || [],
      topDrivers: results[3] || []
    };

    res.json({ analytics });
  }).catch(error => {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  });
};

// Get admin logs
const getAdminLogs = (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  db.all(
    `SELECT al.*, u1.firstName as adminFirstName, u1.lastName as adminLastName,
            u2.firstName as targetFirstName, u2.lastName as targetLastName
     FROM admin_logs al
     JOIN users u1 ON al.adminId = u1.id
     LEFT JOIN users u2 ON al.targetUserId = u2.id
     ORDER BY al.createdAt DESC
     LIMIT ? OFFSET ?`,
    [parseInt(limit), parseInt(offset)],
    (err, logs) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ logs });
    }
  );
};

// Create admin user (super admin only)
const createAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if admin already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Admin already exists' });
      }

      try {
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create admin user
        db.run(
          'INSERT INTO users (email, password, firstName, lastName, userType, isVerified) VALUES (?, ?, ?, ?, "admin", 1)',
          [email, hashedPassword, firstName, lastName],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to create admin' });
            }

            // Log admin action
            db.run(
              'INSERT INTO admin_logs (adminId, action, details) VALUES (?, ?, ?)',
              [req.user.id, 'ADMIN_CREATED', `Created new admin: ${firstName} ${lastName} (${email})`]
            );

            res.status(201).json({ message: 'Admin created successfully' });
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  verifyDriver,
  getAllRides,
  getAnalytics,
  getAdminLogs,
  createAdmin
};