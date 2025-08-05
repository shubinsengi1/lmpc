const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const ridesRoutes = require('./routes/rides');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Uber Clone API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining rooms based on their role
  socket.on('join-room', (data) => {
    const { userId, userType } = data;
    const roomName = `${userType}_${userId}`;
    socket.join(roomName);
    console.log(`User ${userId} joined room: ${roomName}`);
  });

  // Handle driver location updates
  socket.on('driver-location-update', (data) => {
    const { driverId, lat, lng } = data;
    // Broadcast location to users who have active rides with this driver
    socket.broadcast.emit('driver-location', { driverId, lat, lng });
  });

  // Handle ride request updates
  socket.on('ride-update', (data) => {
    socket.broadcast.emit('ride-status-change', data);
  });

  // Handle driver availability
  socket.on('driver-availability', (data) => {
    const { driverId, isAvailable } = data;
    socket.broadcast.emit('driver-status-change', { driverId, isAvailable });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize default admin user
const initializeAdmin = async () => {
  const bcrypt = require('bcrypt');
  const db = require('./config/database');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@uberclone.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Check if admin exists
  db.get('SELECT id FROM users WHERE email = ? AND userType = "admin"', [adminEmail], async (err, admin) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }

    if (!admin) {
      try {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        db.run(
          'INSERT INTO users (email, password, firstName, lastName, userType, isVerified, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [adminEmail, hashedPassword, 'Admin', 'User', 'admin', 1, 1],
          function(err) {
            if (err) {
              console.error('Error creating admin user:', err);
            } else {
              console.log('Default admin user created:');
              console.log('Email:', adminEmail);
              console.log('Password:', adminPassword);
              console.log('Please change the password after first login!');
            }
          }
        );
      } catch (error) {
        console.error('Error hashing admin password:', error);
      }
    }
  });
};

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize admin after server starts
  setTimeout(initializeAdmin, 1000);
});