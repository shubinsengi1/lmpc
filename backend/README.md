# Church Payment Backend

A secure Node.js backend for processing church donations using Stripe payment processing, with email notifications and receipt generation.

## 🌟 Features

- **Stripe Integration**: Secure payment processing with Stripe
- **Email Notifications**: Automatic donation receipts and church notifications
- **Multiple Donation Types**: Support for various church funds and ministries
- **Security**: Rate limiting, input validation, and secure headers
- **Webhooks**: Real-time payment status updates
- **Contact Form**: Backend support for website contact forms

## 🚀 Quick Setup

### 1. Prerequisites

- Node.js 14+ installed
- Stripe account (free at [stripe.com](https://stripe.com))
- Gmail account for email notifications

### 2. Installation

```bash
# Clone and navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### 3. Configuration

Edit `.env` file with your credentials:

```env
# Stripe Keys (from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Email Configuration
EMAIL_USER=your-church-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CHURCH_EMAIL=admin@lmpc.org

# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:8000
```

### 4. Run the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔧 Stripe Setup Guide

### Step 1: Create Stripe Account
1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete business verification (required for live payments)

### Step 2: Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Copy your **Publishable key** and **Secret key**
3. Use test keys for development (start with `pk_test_` and `sk_test_`)

### Step 3: Setup Webhooks
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/webhook`
4. Select events: `payment_intent.succeeded` and `payment_intent.payment_failed`
5. Copy the webhook signing secret

### Step 4: Update Frontend
Edit `payment.js` and update the Stripe publishable key:
```javascript
const publishableKey = 'pk_test_your_actual_publishable_key_here';
```

## 📧 Email Setup (Gmail)

### Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification

### Create App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and your device
3. Copy the generated password
4. Use this password in `EMAIL_PASS` (not your regular Gmail password)

## 🌐 Deployment Options

### Option 1: Heroku (Recommended)

```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-church-backend

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
heroku config:set EMAIL_USER=your-email@gmail.com
heroku config:set EMAIL_PASS=your-app-password
heroku config:set CHURCH_EMAIL=admin@church.org
heroku config:set FRONTEND_URL=https://your-church-website.com

# Deploy
git add .
git commit -m "Deploy church payment backend"
git push heroku main
```

### Option 2: Railway

1. Connect your GitHub repo to [Railway](https://railway.app)
2. Add environment variables in Railway dashboard
3. Deploy automatically on git push

### Option 3: DigitalOcean App Platform

1. Create app on [DigitalOcean](https://cloud.digitalocean.com/apps)
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### Option 4: VPS (Advanced)

```bash
# On your server
git clone your-repo
cd backend
npm install --production

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name church-backend
pm2 startup
pm2 save

# Setup nginx reverse proxy (optional)
sudo nginx -t && sudo systemctl reload nginx
```

## 🔒 Security Checklist

- [ ] Use HTTPS in production (SSL certificate)
- [ ] Set strong `JWT_SECRET` and `SESSION_SECRET`
- [ ] Use Stripe live keys only in production
- [ ] Set up proper CORS origins
- [ ] Enable webhook signature verification
- [ ] Monitor logs for suspicious activity
- [ ] Set up rate limiting (already configured)
- [ ] Use environment variables for all secrets

## 📊 API Endpoints

### Payment Endpoints
- `POST /api/create-payment-intent` - Create payment intent
- `POST /api/webhook` - Stripe webhook handler
- `GET /api/donation-types` - Get available donation types

### Other Endpoints
- `POST /api/contact` - Contact form submission
- `GET /api/health` - Health check

### Example API Usage

```javascript
// Create payment intent
const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        amount: 100, // $100.00
        donationType: 'general',
        donorInfo: {
            name: 'John Doe',
            email: 'john@example.com'
        }
    })
});
```

## 🐛 Troubleshooting

### Common Issues

**Payment form not loading:**
- Check Stripe publishable key in `payment.js`
- Verify backend is running on correct port
- Check browser console for errors

**Emails not sending:**
- Verify Gmail app password is correct
- Check that 2FA is enabled on Gmail account
- Look at server logs for email errors

**Webhook failures:**
- Verify webhook URL is accessible
- Check webhook signing secret
- Ensure webhook endpoint is `/api/webhook`

**CORS errors:**
- Update `FRONTEND_URL` in environment variables
- Check that frontend and backend URLs match

### Debug Mode

```bash
# Enable debug logging
DEBUG=stripe:* npm run dev
```

## 📈 Monitoring & Analytics

### Stripe Dashboard
- Monitor payments at [dashboard.stripe.com](https://dashboard.stripe.com)
- View failed payments and disputes
- Generate financial reports

### Application Logs
```bash
# View logs (PM2)
pm2 logs church-backend

# View logs (Heroku)
heroku logs --tail --app your-church-backend
```

## 🔄 Going Live

### Checklist for Production

1. **Switch to Live Keys**
   - Replace test Stripe keys with live keys
   - Update webhook endpoint to production URL

2. **SSL Certificate**
   - Ensure HTTPS is enabled
   - Test SSL rating at [ssllabs.com](https://www.ssllabs.com/ssltest/)

3. **Domain Setup**
   - Point custom domain to your backend
   - Update `FRONTEND_URL` environment variable

4. **Email Testing**
   - Send test donation to verify emails work
   - Check spam folders for donation receipts

5. **Final Testing**
   - Test small donation with real credit card
   - Verify receipt email is received
   - Check Stripe dashboard for payment

## 💰 Pricing

### Stripe Fees
- **2.9% + 30¢** per successful card charge
- **3.4% + 30¢** for American Express
- No setup fees or monthly fees

### Hosting Costs (Monthly)
- **Heroku**: Free tier available, paid plans from $7/month
- **Railway**: $5/month for basic plan
- **DigitalOcean**: $5/month for basic droplet
- **VPS Providers**: $3-10/month

## 📞 Support

- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Technical Issues**: Check GitHub issues or create new issue
- **General Questions**: Contact through church website

---

**Built with security and reliability in mind for church communities** 🙏