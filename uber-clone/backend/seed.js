const bcrypt = require('bcrypt');
const db = require('./config/database');

const seedData = async () => {
  console.log('Starting database seeding...');

  try {
    // Hash password for demo accounts
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Demo Users
    const demoUsers = [
      {
        email: 'user@demo.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        userType: 'user',
        isVerified: 1,
        isActive: 1
      },
      {
        email: 'driver@demo.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1234567891',
        userType: 'driver',
        isVerified: 1,
        isActive: 1
      },
      {
        email: 'driver2@demo.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '+1234567892',
        userType: 'driver',
        isVerified: 1,
        isActive: 1
      }
    ];

    // Insert demo users
    for (const user of demoUsers) {
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT OR IGNORE INTO users (email, password, firstName, lastName, phone, userType, isVerified, isActive) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [user.email, user.password, user.firstName, user.lastName, user.phone, user.userType, user.isVerified, user.isActive],
          function(err) {
            if (err) {
              console.error('Error inserting user:', err);
              reject(err);
            } else {
              console.log(`Created user: ${user.email}`);
              resolve(this.lastID);
            }
          }
        );
      });
    }

    // Add driver information for demo drivers
    const driverData = [
      {
        email: 'driver@demo.com',
        licenseNumber: 'DL123456789',
        vehicleModel: 'Toyota Camry',
        vehiclePlate: 'ABC-123',
        vehicleColor: 'Silver',
        vehicleYear: 2020,
        documentsVerified: 1
      },
      {
        email: 'driver2@demo.com',
        licenseNumber: 'DL987654321',
        vehicleModel: 'Honda Civic',
        vehiclePlate: 'XYZ-789',
        vehicleColor: 'Blue',
        vehicleYear: 2019,
        documentsVerified: 1
      }
    ];

    for (const driver of driverData) {
      // Get user ID first
      await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [driver.email], (err, user) => {
          if (err) {
            reject(err);
          } else if (user) {
            // Insert driver data
            db.run(
              `INSERT OR IGNORE INTO drivers (userId, licenseNumber, vehicleModel, vehiclePlate, vehicleColor, vehicleYear, documentsVerified) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [user.id, driver.licenseNumber, driver.vehicleModel, driver.vehiclePlate, driver.vehicleColor, driver.vehicleYear, driver.documentsVerified],
              (err) => {
                if (err) {
                  console.error('Error inserting driver:', err);
                  reject(err);
                } else {
                  console.log(`Created driver profile for: ${driver.email}`);
                  resolve();
                }
              }
            );
          } else {
            resolve();
          }
        });
      });
    }

    // Add some sample rides
    const sampleRides = [
      {
        userEmail: 'user@demo.com',
        driverEmail: 'driver@demo.com',
        pickupLat: 40.7128,
        pickupLng: -74.0060,
        pickupAddress: '123 Main St, New York, NY',
        destinationLat: 40.7589,
        destinationLng: -73.9851,
        destinationAddress: '456 Broadway, New York, NY',
        distance: 5.2,
        duration: 15,
        fare: 8.74,
        status: 'completed',
        rating: 5
      },
      {
        userEmail: 'user@demo.com',
        driverEmail: 'driver2@demo.com',
        pickupLat: 40.7589,
        pickupLng: -73.9851,
        pickupAddress: '456 Broadway, New York, NY',
        destinationLat: 40.7505,
        destinationLng: -73.9934,
        destinationAddress: '789 Times Square, New York, NY',
        distance: 2.1,
        duration: 8,
        fare: 5.02,
        status: 'completed',
        rating: 4
      }
    ];

    for (const ride of sampleRides) {
      // Get user and driver IDs
      const userId = await new Promise((resolve) => {
        db.get('SELECT id FROM users WHERE email = ?', [ride.userEmail], (err, user) => {
          resolve(user ? user.id : null);
        });
      });

      const driverId = await new Promise((resolve) => {
        db.get('SELECT id FROM users WHERE email = ?', [ride.driverEmail], (err, driver) => {
          resolve(driver ? driver.id : null);
        });
      });

      if (userId && driverId) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO rides (userId, driverId, pickupLat, pickupLng, pickupAddress, destinationLat, destinationLng, destinationAddress, distance, duration, fare, status, rating) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, driverId, ride.pickupLat, ride.pickupLng, ride.pickupAddress, ride.destinationLat, ride.destinationLng, ride.destinationAddress, ride.distance, ride.duration, ride.fare, ride.status, ride.rating],
            (err) => {
              if (err) {
                console.error('Error inserting ride:', err);
                reject(err);
              } else {
                console.log(`Created sample ride from ${ride.pickupAddress} to ${ride.destinationAddress}`);
                resolve();
              }
            }
          );
        });

        // Update user's total rides
        db.run('UPDATE users SET totalRides = totalRides + 1 WHERE id = ?', [userId]);
      }
    }

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nDemo Accounts Created:');
    console.log('👤 User: user@demo.com / demo123');
    console.log('🚗 Driver: driver@demo.com / demo123');
    console.log('🚗 Driver: driver2@demo.com / demo123');
    console.log('👨‍💼 Admin: admin@uberclone.com / admin123');
    console.log('\nYou can now test the application with these accounts!');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData().then(() => {
    process.exit(0);
  });
}

module.exports = seedData;