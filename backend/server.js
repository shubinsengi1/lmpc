const express = require('express');
const stripe = require('stripe');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe
const stripeInstance = stripe(process.env.STRIPE_SECRET_KEY);

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8000',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Payment specific rate limiting
const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 payment attempts per 15 minutes
    message: 'Too many payment attempts, please try again later.'
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Email transporter setup
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Church Payment Server is running',
        timestamp: new Date().toISOString()
    });
});

// Create Payment Intent endpoint
app.post('/api/create-payment-intent', paymentLimiter, async (req, res) => {
    try {
        const { amount, currency = 'usd', donationType, donorInfo } = req.body;

        // Validation
        if (!amount || amount < 50) { // Minimum $0.50
            return res.status(400).json({ 
                error: 'Invalid amount. Minimum donation is $0.50' 
            });
        }

        if (!donorInfo || !donorInfo.email) {
            return res.status(400).json({ 
                error: 'Donor email is required' 
            });
        }

        // Create payment intent
        const paymentIntent = await stripeInstance.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                donationType: donationType || 'general',
                donorEmail: donorInfo.email,
                donorName: donorInfo.name || 'Anonymous',
                churchName: 'Living Mercy Presbyterian Church'
            },
            receipt_email: donorInfo.email,
            description: `Donation to Living Mercy Presbyterian Church - ${donationType || 'General Fund'}`
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });

    } catch (error) {
        console.error('Payment intent creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create payment intent' 
        });
    }
});

// Webhook endpoint for Stripe events
app.post('/api/webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            await handleSuccessfulPayment(paymentIntent);
            break;
        
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            await handleFailedPayment(failedPayment);
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent) {
    try {
        const { metadata } = paymentIntent;
        const amount = paymentIntent.amount / 100; // Convert from cents
        
        // Send confirmation email to donor
        await sendDonationConfirmation({
            email: metadata.donorEmail,
            name: metadata.donorName,
            amount: amount,
            donationType: metadata.donationType,
            paymentIntentId: paymentIntent.id
        });

        // Send notification to church
        await sendChurchNotification({
            donorName: metadata.donorName,
            donorEmail: metadata.donorEmail,
            amount: amount,
            donationType: metadata.donationType,
            paymentIntentId: paymentIntent.id
        });

        console.log('Payment processed successfully:', paymentIntent.id);
    } catch (error) {
        console.error('Error handling successful payment:', error);
    }
}

// Handle failed payment
async function handleFailedPayment(paymentIntent) {
    try {
        console.log('Payment failed:', paymentIntent.id);
        // You could send a notification email here if needed
    } catch (error) {
        console.error('Error handling failed payment:', error);
    }
}

// Send donation confirmation email
async function sendDonationConfirmation(donationInfo) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: donationInfo.email,
        subject: 'Thank You for Your Donation - Living Mercy Presbyterian Church',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #3498db; color: white; padding: 20px; text-align: center;">
                    <h1>Thank You for Your Generous Gift!</h1>
                </div>
                
                <div style="padding: 20px; background-color: #f8f9fa;">
                    <p>Dear ${donationInfo.name},</p>
                    
                    <p>Thank you for your generous donation to Living Mercy Presbyterian Church. Your gift helps us continue our mission of loving God, loving others, and making disciples.</p>
                    
                    <div style="background-color: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c3e50; margin-top: 0;">Donation Details:</h3>
                        <p><strong>Amount:</strong> $${donationInfo.amount.toFixed(2)}</p>
                        <p><strong>Donation Type:</strong> ${donationInfo.donationType}</p>
                        <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Transaction ID:</strong> ${donationInfo.paymentIntentId}</p>
                    </div>
                    
                    <p>This email serves as your receipt for tax purposes. Living Mercy Presbyterian Church is a 501(c)(3) organization, and your donation is tax-deductible to the full extent allowed by law.</p>
                    
                    <p>If you have any questions about your donation, please don't hesitate to contact us at (555) 123-4567 or info@lmpc.org.</p>
                    
                    <p>Blessings,<br>
                    The LMPC Team</p>
                </div>
                
                <div style="background-color: #2c3e50; color: white; padding: 15px; text-align: center; font-size: 12px;">
                    <p>Living Mercy Presbyterian Church<br>
                    123 Faith Street, Cityville, ST 12345<br>
                    (555) 123-4567 | info@lmpc.org</p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Send notification to church
async function sendChurchNotification(donationInfo) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.CHURCH_EMAIL || 'admin@lmpc.org',
        subject: 'New Donation Received - LMPC',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #3498db;">New Donation Received</h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                    <p><strong>Donor:</strong> ${donationInfo.donorName}</p>
                    <p><strong>Email:</strong> ${donationInfo.donorEmail}</p>
                    <p><strong>Amount:</strong> $${donationInfo.amount.toFixed(2)}</p>
                    <p><strong>Type:</strong> ${donationInfo.donationType}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Transaction ID:</strong> ${donationInfo.paymentIntentId}</p>
                </div>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message, phone } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ 
                error: 'Name, email, and message are required' 
            });
        }

        // Send email to church
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.CHURCH_EMAIL || 'admin@lmpc.org',
            subject: `Contact Form: ${subject || 'General Inquiry'}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
                <p><strong>Message:</strong></p>
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px;">
                    ${message.replace(/\n/g, '<br>')}
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            success: true, 
            message: 'Your message has been sent successfully!' 
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            error: 'Failed to send message. Please try again.' 
        });
    }
});

// Get donation types
app.get('/api/donation-types', (req, res) => {
    res.json([
        { id: 'general', name: 'General Fund', description: 'Support our day-to-day operations and ministries' },
        { id: 'missions', name: 'Missions', description: 'Support local and international mission work' },
        { id: 'building', name: 'Building Fund', description: 'Help maintain and improve our facilities' },
        { id: 'youth', name: 'Youth Ministry', description: 'Support programs for teenagers' },
        { id: 'children', name: 'Children\'s Ministry', description: 'Support programs for children' },
        { id: 'benevolence', name: 'Benevolence Fund', description: 'Help families and individuals in need' },
        { id: 'tithe', name: 'Tithe', description: 'Regular tithing contribution' }
    ]);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        error: 'Internal server error' 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Endpoint not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Church Payment Server running on port ${PORT}`);
    console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No'}`);
    console.log(`💳 Stripe configured: ${process.env.STRIPE_SECRET_KEY ? 'Yes' : 'No'}`);
});

module.exports = app;