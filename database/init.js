const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'donations.db');

// Ensure data directory exists
const fs = require('fs');
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

const initDatabase = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create donations table
            db.run(`CREATE TABLE IF NOT EXISTS donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stripe_payment_intent_id TEXT UNIQUE NOT NULL,
                amount REAL NOT NULL,
                donor_email TEXT NOT NULL,
                donor_name TEXT NOT NULL,
                donor_phone TEXT,
                donor_address TEXT,
                designation TEXT DEFAULT 'General Fund',
                is_recurring BOOLEAN DEFAULT 0,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`, (err) => {
                if (err) {
                    console.error('Error creating donations table:', err.message);
                    reject(err);
                } else {
                    console.log('Donations table ready');
                }
            });

            // Create donation_receipts table for tracking email receipts
            db.run(`CREATE TABLE IF NOT EXISTS donation_receipts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donation_id INTEGER NOT NULL,
                receipt_sent BOOLEAN DEFAULT 0,
                email_sent_at DATETIME,
                FOREIGN KEY (donation_id) REFERENCES donations (id)
            )`, (err) => {
                if (err) {
                    console.error('Error creating donation_receipts table:', err.message);
                    reject(err);
                } else {
                    console.log('Donation receipts table ready');
                }
            });

            // Create indexes for better performance
            db.run(`CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(donor_email)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_donations_date ON donations(created_at)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_donations_designation ON donations(designation)`);
            db.run(`CREATE INDEX IF NOT EXISTS idx_stripe_payment_intent ON donations(stripe_payment_intent_id)`);

            resolve();
        });
    });
};

const getDatabase = () => {
    return db;
};

const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
                reject(err);
            } else {
                console.log('Database connection closed');
                resolve();
            }
        });
    });
};

module.exports = {
    initDatabase,
    getDatabase,
    closeDatabase
};