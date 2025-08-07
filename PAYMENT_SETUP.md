# 💳 Payment System Setup Guide
## Light Mission Pentecostal Church of Atlanta

This guide will help you set up secure online donations for your church website using Stripe.

## 🚀 Quick Start

1. **Run the automated setup**:
   ```bash
   npm run setup
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Test your configuration**:
   ```bash
   npm run test-stripe
   npm run test-email
   ```

4. **Start the server**:
   ```bash
   npm run dev
   ```

5. **Test donations** by visiting `http://localhost:3000/give`

## 📋 Prerequisites

### 1. Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Complete account verification
- Get your API keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### 2. Email Account for Receipts
- Church email account (Gmail recommended for easy setup)
- App-specific password if using Gmail with 2FA

### 3. Church Information
- Federal Tax ID (EIN)
- Physical address
- Phone number

## 🔧 Manual Configuration

If you prefer to set up manually instead of using `npm run setup`:

### 1. Create Environment File

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

### 2. Configure Stripe

**Test Mode (Development):**
- Use keys starting with `pk_test_` and `sk_test_`
- Test payments won't charge real money

**Live Mode (Production):**
- Use keys starting with `pk_live_` and `sk_live_`
- Real payments will be processed

### 3. Set Up Webhooks

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://yourdomain.com/api/donations/webhook`
4. Select these events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the webhook signing secret to your `.env` file

### 4. Configure Email

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an app-specific password
3. Use your Gmail address and app password in `.env`

**For other email providers:**
- Update the email configuration in `utils/email.js`
- Modify the transporter settings as needed

## 🛡️ Security Features

### Built-in Security
- ✅ Rate limiting (5 donation attempts per 15 minutes)
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Encrypted payment processing via Stripe
- ✅ Webhook signature verification

### Security Best Practices
- Never commit `.env` files to version control
- Use test keys during development
- Regularly rotate API keys
- Monitor transaction logs
- Set up alerts for unusual activity

## 💾 Database

The system uses SQLite for storing donation records:

```bash
# Initialize database
npm run create-db
```

**Database Location:** `./data/donations.db`

**Tables:**
- `donations` - Main donation records
- `donation_receipts` - Email receipt tracking

## 📧 Email Receipts

Automatic email receipts are sent to donors containing:
- Donation amount and designation
- Receipt number for tax purposes
- Church tax ID (EIN)
- Professional HTML formatting

## 🧪 Testing

### Test Credit Cards (Stripe Test Mode)
- **Successful payment:** `4242 4242 4242 4242`
- **Declined payment:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0002 0000 1976`

Use any future expiration date and any 3-digit CVC.

### Test Donations
1. Visit your website's `/give` page
2. Click "Give Online Now"
3. Fill out the donation form
4. Use a test credit card
5. Verify receipt email is sent

## 📊 Monitoring & Analytics

### Available Endpoints
- `GET /api/donations/stats` - Donation statistics
- `GET /api/health` - System health check

### Logs
- Server logs: Console output
- Payment logs: Stripe Dashboard
- Email logs: Check email service provider

## 🚨 Troubleshooting

### Common Issues

**"Stripe key not found"**
- Check that your `.env` file has the correct Stripe keys
- Verify keys are not wrapped in quotes

**"Email sending failed"**
- Test email configuration: `npm run test-email`
- Check app-specific password for Gmail
- Verify email credentials in `.env`

**"Database error"**
- Initialize database: `npm run create-db`
- Check file permissions for `./data/` directory

**"Webhook verification failed"**
- Verify webhook secret in `.env`
- Check webhook URL is publicly accessible
- Ensure webhook is configured for correct events

### Debug Mode
Set `NODE_ENV=development` in `.env` for detailed error messages.

## 🔄 Going Live

### Pre-Launch Checklist
- [ ] Switch to live Stripe keys
- [ ] Update webhook URL to production domain
- [ ] Test with small real donation
- [ ] Verify email receipts work
- [ ] Check SSL certificate is valid
- [ ] Review security headers
- [ ] Set up monitoring/alerts

### Production Environment Variables
```bash
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
# Use live Stripe keys (pk_live_... and sk_live_...)
```

## 📞 Support

### Technical Support
- Stripe: [support.stripe.com](https://support.stripe.com)
- Email issues: Check your email provider's documentation

### Church-Specific Support
For help with this system:
1. Check this documentation
2. Review error logs
3. Test with Stripe's test cards
4. Verify all environment variables

## 🔐 Compliance

### PCI Compliance
- ✅ Stripe handles all card data (PCI compliant)
- ✅ Your server never stores card information
- ✅ All payments processed through Stripe's secure servers

### Tax Requirements
- ✅ Automatic receipt generation
- ✅ Tax ID included in receipts
- ✅ Donation records stored securely
- ✅ Annual giving statements possible

## 📈 Features

### Current Features
- ✅ One-time donations
- ✅ Multiple designations (General Fund, Missions, etc.)
- ✅ Secure payment processing
- ✅ Automatic email receipts
- ✅ Donation history tracking
- ✅ Mobile-responsive donation form

### Future Enhancements
- 🔄 Recurring donations
- 🔄 Admin dashboard
- 🔄 Advanced reporting
- 🔄 Text-to-give integration
- 🔄 Donor management system

---

## 🎉 You're All Set!

Your church now has a professional, secure donation system. Test thoroughly before going live, and remember to switch to live Stripe keys when ready for real donations.

**Questions?** Review the troubleshooting section or check the logs for specific error messages.