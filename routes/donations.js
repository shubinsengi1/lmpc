const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const validator = require('validator');
const { saveDonation, getDonationStats } = require('../database/donations');
const { sendDonationReceipt } = require('../utils/email');

const router = express.Router();

// Validation middleware
const validateDonationData = (req, res, next) => {
    const { amount, donorInfo, designation } = req.body;
    
    if (!amount || amount < 1) {
        return res.status(400).json({
            error: { message: 'Donation amount must be at least $1', type: 'validation_error' }
        });
    }
    
    if (amount > 100000) {
        return res.status(400).json({
            error: { message: 'Donation amount cannot exceed $100,000', type: 'validation_error' }
        });
    }
    
    if (!donorInfo || !donorInfo.email || !donorInfo.firstName || !donorInfo.lastName) {
        return res.status(400).json({
            error: { message: 'First name, last name, and email are required', type: 'validation_error' }
        });
    }
    
    if (!validator.isEmail(donorInfo.email)) {
        return res.status(400).json({
            error: { message: 'Please provide a valid email address', type: 'validation_error' }
        });
    }
    
    // Sanitize inputs
    req.body.donorInfo.firstName = validator.escape(donorInfo.firstName.trim());
    req.body.donorInfo.lastName = validator.escape(donorInfo.lastName.trim());
    req.body.donorInfo.email = validator.normalizeEmail(donorInfo.email);
    
    if (donorInfo.phone) {
        req.body.donorInfo.phone = validator.escape(donorInfo.phone.trim());
    }
    
    if (donorInfo.address) {
        req.body.donorInfo.address = validator.escape(donorInfo.address.trim());
    }
    
    next();
};

// Create payment intent
router.post('/create-payment-intent', validateDonationData, async (req, res) => {
    try {
        const { amount, donorInfo, designation, isRecurring } = req.body;
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'usd',
            metadata: {
                donorName: `${donorInfo.firstName} ${donorInfo.lastName}`,
                donorEmail: donorInfo.email,
                designation: designation || 'General Fund',
                isRecurring: isRecurring ? 'true' : 'false'
            },
            receipt_email: donorInfo.email,
            description: `Donation to Living Mercy Presbyterian Church - ${designation || 'General Fund'}`
        });
        
        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
        
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            error: {
                message: 'Unable to process donation at this time',
                type: 'payment_error'
            }
        });
    }
});

// Confirm donation
router.post('/confirm', async (req, res) => {
    try {
        const { paymentIntentId, donorInfo, amount, designation } = req.body;
        
        // Retrieve payment intent from Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                error: {
                    message: 'Payment was not successful',
                    type: 'payment_error'
                }
            });
        }
        
        // Save donation to database
        const donation = await saveDonation({
            stripePaymentIntentId: paymentIntentId,
            amount: amount,
            donorEmail: donorInfo.email,
            donorName: `${donorInfo.firstName} ${donorInfo.lastName}`,
            donorPhone: donorInfo.phone || null,
            donorAddress: donorInfo.address || null,
            designation: designation || 'General Fund',
            isRecurring: false,
            status: 'completed'
        });
        
        // Send receipt email
        try {
            await sendDonationReceipt({
                donorEmail: donorInfo.email,
                donorName: `${donorInfo.firstName} ${donorInfo.lastName}`,
                amount: amount,
                designation: designation || 'General Fund',
                donationId: donation.id,
                date: new Date().toLocaleDateString()
            });
        } catch (emailError) {
            console.error('Error sending receipt email:', emailError);
            // Don't fail the donation if email fails
        }
        
        res.json({
            success: true,
            donationId: donation.id,
            message: 'Thank you for your generous donation!'
        });
        
    } catch (error) {
        console.error('Error confirming donation:', error);
        res.status(500).json({
            error: {
                message: 'Unable to confirm donation',
                type: 'server_error'
            }
        });
    }
});

// Get donation statistics (for admin dashboard)
router.get('/stats', async (req, res) => {
    try {
        const stats = await getDonationStats();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching donation stats:', error);
        res.status(500).json({
            error: {
                message: 'Unable to fetch donation statistics',
                type: 'server_error'
            }
        });
    }
});

// Stripe webhook for handling payment events
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            console.log('Payment succeeded:', event.data.object.id);
            // Additional processing if needed
            break;
        case 'payment_intent.payment_failed':
            console.log('Payment failed:', event.data.object.id);
            // Handle failed payment
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }
    
    res.json({ received: true });
});

module.exports = router;