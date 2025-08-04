# Living Mercy Presbyterian Church Website

A professional church website with integrated donation processing, built with Node.js, Express, and Stripe.

## 🚀 Quick Deploy

**Deploy your website in 5 minutes:**

1. **Read**: `QUICK_DEPLOY.md` for immediate deployment
2. **Run**: `./deploy.sh` to check your setup
3. **Deploy**: Follow the guide to deploy on Render (free)

## Features

- **Professional Design**: Modern, corporate-style design with clean typography
- **Secure Donations**: Stripe-powered payment processing
- **Email Receipts**: Automated tax-deductible donation receipts
- **Database Tracking**: SQLite database for donation records
- **Security**: Rate limiting, input validation, and secure payment handling
- **Responsive**: Mobile-friendly design for all devices

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Stripe account for payment processing
- Email service for receipts

### Local Development
```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Deployment
```bash
# Check your setup
./deploy.sh

# Follow deployment guide
# See QUICK_DEPLOY.md for 5-minute deployment
```

## Configuration

### Required Environment Variables
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `EMAIL_SERVICE`: Email service (gmail/smtp)
- `EMAIL_USER`: Email username
- `EMAIL_PASSWORD`: Email password
- `FROM_EMAIL`: Sender email address
- `ADMIN_EMAIL`: Admin notification email

### Stripe Setup
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard → Developers → API Keys
3. Set up webhook endpoint for donation processing
4. Update `donation.js` with your publishable key

## File Structure

```
├── server.js              # Express server
├── package.json           # Dependencies
├── donation.js            # Frontend donation processing
├── style.css              # Main stylesheet
├── index.html             # Homepage
├── give.html              # Donation page
├── routes/                # API routes
├── database/              # Database files
├── utils/                 # Utility functions
└── images/                # Website images
```

## Deployment Options

### Free Platforms
- **Render** (Recommended): Easy setup, free tier
- **Railway**: Auto-detects Node.js, free tier
- **Vercel**: Great for static sites

### Paid Platforms
- **Heroku**: Reliable, $7/month minimum
- **DigitalOcean**: Full control, $5/month
- **AWS**: Enterprise-grade, pay-per-use

## Security Features

- HTTPS enforcement
- Rate limiting (100 requests/15min)
- Input validation and sanitization
- Secure headers (Helmet.js)
- CORS protection
- Stripe handles sensitive payment data

## Testing

### Stripe Test Cards
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0000 0000 3220`

### Local Testing
```bash
npm start
# Visit http://localhost:3000
```

## Support

- **Deployment**: See `DEPLOYMENT.md` for detailed instructions
- **Setup**: See `SETUP.md` for configuration guide
- **Quick Deploy**: See `QUICK_DEPLOY.md` for 5-minute deployment

## License

MIT License - see LICENSE file for details.

---

**Ready to deploy?** Start with `QUICK_DEPLOY.md` for immediate deployment!