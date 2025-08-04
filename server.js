const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const donationRoutes = require('./routes/donations');
const { initDatabase } = require('./database/init');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://kit.fontawesome.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://kit.fontawesome.com", "https://js.stripe.com"],
            fontSrc: ["'self'", "https://kit.fontawesome.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.stripe.com"],
            frameSrc: ["'self'", "https://js.stripe.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Donation-specific rate limiting
const donationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 donation attempts per 15 minutes
    message: 'Too many donation attempts, please try again later.'
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Routes
app.use('/api/donations', donationLimiter, donationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'LMPC Donation Service'
    });
});

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/give', (req, res) => {
    res.sendFile(path.join(__dirname, 'give.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    if (err.type === 'StripeCardError') {
        return res.status(400).json({
            error: {
                message: err.message,
                type: 'card_error'
            }
        });
    }
    
    if (err.type === 'StripeInvalidRequestError') {
        return res.status(400).json({
            error: {
                message: 'Invalid request parameters',
                type: 'invalid_request'
            }
        });
    }
    
    res.status(500).json({
        error: {
            message: 'An unexpected error occurred',
            type: 'server_error'
        }
    });
});

// Initialize database and start server
async function startServer() {
    try {
        await initDatabase();
        console.log('Database initialized successfully');
        
        app.listen(PORT, () => {
            console.log(`LMPC Server running on http://localhost:${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;