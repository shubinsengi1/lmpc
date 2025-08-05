const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/uber_clone.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

// Initialize database tables
function initializeTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      phone TEXT,
      profileImage TEXT,
      userType TEXT DEFAULT 'user' CHECK(userType IN ('user', 'driver', 'admin')),
      isActive BOOLEAN DEFAULT 1,
      isVerified BOOLEAN DEFAULT 0,
      rating REAL DEFAULT 5.0,
      totalRides INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Driver specific information
  db.run(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      licenseNumber TEXT NOT NULL,
      vehicleModel TEXT NOT NULL,
      vehiclePlate TEXT NOT NULL,
      vehicleColor TEXT NOT NULL,
      vehicleYear INTEGER NOT NULL,
      isAvailable BOOLEAN DEFAULT 0,
      currentLat REAL,
      currentLng REAL,
      documentsVerified BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Rides table
  db.run(`
    CREATE TABLE IF NOT EXISTS rides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      driverId INTEGER,
      pickupLat REAL NOT NULL,
      pickupLng REAL NOT NULL,
      pickupAddress TEXT NOT NULL,
      destinationLat REAL NOT NULL,
      destinationLng REAL NOT NULL,
      destinationAddress TEXT NOT NULL,
      distance REAL,
      duration INTEGER,
      fare REAL,
      status TEXT DEFAULT 'requested' CHECK(
        status IN ('requested', 'accepted', 'arrived', 'started', 'completed', 'cancelled')
      ),
      paymentMethod TEXT DEFAULT 'cash',
      paymentStatus TEXT DEFAULT 'pending',
      rating INTEGER,
      feedback TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (driverId) REFERENCES users (id)
    )
  `);

  // Admin logs table
  db.run(`
    CREATE TABLE IF NOT EXISTS admin_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      adminId INTEGER NOT NULL,
      action TEXT NOT NULL,
      details TEXT,
      targetUserId INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (adminId) REFERENCES users (id),
      FOREIGN KEY (targetUserId) REFERENCES users (id)
    )
  `);

  console.log('Database tables initialized');
}

module.exports = db;