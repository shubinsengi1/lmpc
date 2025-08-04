const { getDatabase } = require('./init');

const saveDonation = (donationData) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const {
            stripePaymentIntentId,
            amount,
            donorEmail,
            donorName,
            donorPhone,
            donorAddress,
            designation,
            isRecurring,
            status
        } = donationData;

        const sql = `INSERT INTO donations (
            stripe_payment_intent_id,
            amount,
            donor_email,
            donor_name,
            donor_phone,
            donor_address,
            designation,
            is_recurring,
            status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            stripePaymentIntentId,
            amount,
            donorEmail,
            donorName,
            donorPhone,
            donorAddress,
            designation,
            isRecurring ? 1 : 0,
            status
        ];

        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error saving donation:', err.message);
                reject(err);
            } else {
                resolve({ id: this.lastID, ...donationData });
            }
        });
    });
};

const getDonationById = (id) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const sql = `SELECT * FROM donations WHERE id = ?`;

        db.get(sql, [id], (err, row) => {
            if (err) {
                console.error('Error fetching donation:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const getDonationByStripeId = (stripePaymentIntentId) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const sql = `SELECT * FROM donations WHERE stripe_payment_intent_id = ?`;

        db.get(sql, [stripePaymentIntentId], (err, row) => {
            if (err) {
                console.error('Error fetching donation by Stripe ID:', err.message);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
};

const getDonationsByEmail = (email, limit = 50) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const sql = `SELECT * FROM donations WHERE donor_email = ? ORDER BY created_at DESC LIMIT ?`;

        db.all(sql, [email, limit], (err, rows) => {
            if (err) {
                console.error('Error fetching donations by email:', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const getDonationStats = () => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        
        // Get current year stats
        const currentYear = new Date().getFullYear();
        const yearStart = `${currentYear}-01-01`;
        const yearEnd = `${currentYear}-12-31`;
        
        // Get current month stats
        const currentMonth = new Date().getMonth() + 1;
        const monthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const monthEnd = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

        const queries = {
            totalDonations: `SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = 'completed'`,
            yearlyStats: `SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = 'completed' AND created_at BETWEEN ? AND ?`,
            monthlyStats: `SELECT COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = 'completed' AND created_at >= ? AND created_at < ?`,
            designationStats: `SELECT designation, COUNT(*) as count, SUM(amount) as total FROM donations WHERE status = 'completed' GROUP BY designation ORDER BY total DESC`,
            recentDonations: `SELECT donor_name, amount, designation, created_at FROM donations WHERE status = 'completed' ORDER BY created_at DESC LIMIT 10`
        };

        const results = {};

        // Execute all queries
        Promise.all([
            new Promise((resolve, reject) => {
                db.get(queries.totalDonations, [], (err, row) => {
                    if (err) reject(err);
                    else resolve({ totalDonations: row });
                });
            }),
            new Promise((resolve, reject) => {
                db.get(queries.yearlyStats, [yearStart, yearEnd], (err, row) => {
                    if (err) reject(err);
                    else resolve({ yearlyStats: row });
                });
            }),
            new Promise((resolve, reject) => {
                db.get(queries.monthlyStats, [monthStart, monthEnd], (err, row) => {
                    if (err) reject(err);
                    else resolve({ monthlyStats: row });
                });
            }),
            new Promise((resolve, reject) => {
                db.all(queries.designationStats, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve({ designationStats: rows });
                });
            }),
            new Promise((resolve, reject) => {
                db.all(queries.recentDonations, [], (err, rows) => {
                    if (err) reject(err);
                    else resolve({ recentDonations: rows });
                });
            })
        ]).then(queryResults => {
            const stats = {};
            queryResults.forEach(result => {
                Object.assign(stats, result);
            });
            resolve(stats);
        }).catch(reject);
    });
};

const updateDonationStatus = (id, status) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const sql = `UPDATE donations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        db.run(sql, [status, id], function(err) {
            if (err) {
                console.error('Error updating donation status:', err.message);
                reject(err);
            } else {
                resolve({ id, status, changes: this.changes });
            }
        });
    });
};

const saveReceiptRecord = (donationId, emailSent = false) => {
    return new Promise((resolve, reject) => {
        const db = getDatabase();
        const sql = `INSERT INTO donation_receipts (donation_id, receipt_sent, email_sent_at) VALUES (?, ?, ?)`;
        const emailSentAt = emailSent ? new Date().toISOString() : null;

        db.run(sql, [donationId, emailSent ? 1 : 0, emailSentAt], function(err) {
            if (err) {
                console.error('Error saving receipt record:', err.message);
                reject(err);
            } else {
                resolve({ id: this.lastID, donationId, emailSent });
            }
        });
    });
};

module.exports = {
    saveDonation,
    getDonationById,
    getDonationByStripeId,
    getDonationsByEmail,
    getDonationStats,
    updateDonationStatus,
    saveReceiptRecord
};