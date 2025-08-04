# Living Mercy Presbyterian Church Website Setup Guide

This guide will help you set up the professional church website with integrated donation processing.

## Features

- **Professional Design**: Modern, corporate-style design with clean typography and refined color scheme
- **Donation Processing**: Secure payment processing with Stripe integration
- **Email Receipts**: Automated tax-deductible donation receipts
- **Database Tracking**: SQLite database for donation records and reporting
- **Security**: Rate limiting, input validation, and secure payment handling
- **Responsive**: Mobile-friendly design that works on all devices

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Stripe account for payment processing
- Email service for receipts (Gmail, SMTP, or email service provider)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# Stripe Configuration (Replace with your actual keys)
STRIPE_PUBLISHABLE_KEY=pk_live_your_actual_publishable_key
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password

# Email Addresses
FROM_EMAIL=donations@lmpc.org
ADMIN_EMAIL=admin@lmpc.org
```

### 3. Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Update `donation.js` with your publishable key:
   ```javascript
   const stripe = Stripe('pk_live_your_actual_publishable_key');
   ```
4. Set up a webhook endpoint in Stripe Dashboard:
   - URL: `https://your-domain.com/api/donations/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 4. Email Configuration

#### Option A: Gmail (Recommended for testing)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app-specific password
3. Update your `.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   ```

#### Option B: SMTP Provider (Recommended for production)
Use a professional email service like SendGrid, Mailgun, or your hosting provider's SMTP:
```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASSWORD=your-password
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The website will be available at `http://localhost:3000`

## Database

The application uses SQLite for data storage. The database will be automatically created in the `data/` directory when you first run the server.

### Database Structure

- **donations**: Stores donation records
- **donation_receipts**: Tracks email receipt delivery

## Security Features

- **Rate Limiting**: Prevents abuse with request limits
- **Input Validation**: Sanitizes and validates all user inputs
- **Secure Headers**: Helmet.js for security headers
- **Payment Security**: Stripe handles all sensitive payment data
- **CORS Protection**: Configured for your domain only

## Customization

### Church Information
Update the following files with your church's information:

1. **Contact Information**: Update in all HTML files and `utils/email.js`
2. **Church Name**: Search and replace "Living Mercy Presbyterian Church"
3. **Tax ID**: Update EIN in `utils/email.js` and `give.html`
4. **Address**: Update in HTML files and email templates

### Styling
The website uses a professional color scheme defined in CSS variables:
- Primary: Blue (#2563eb)
- Secondary: Green (#059669)
- Accent: Red (#dc2626)

To customize colors, update the `:root` variables in `style.css`.

### Donation Designations
Update the designation options in `give.html`:
```html
<select id="designation" name="designation" required>
    <option value="General Fund">General Fund</option>
    <option value="Your Custom Fund">Your Custom Fund</option>
</select>
```

## Deployment

### Option 1: Traditional Hosting
1. Upload all files to your web server
2. Install Node.js on your server
3. Run `npm install --production`
4. Configure your `.env` file
5. Use PM2 or similar for process management:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "lmpc-website"
   ```

### Option 2: Heroku
1. Create a Heroku app
2. Add your environment variables in Heroku settings
3. Deploy using Git:
   ```bash
   git add .
   git commit -m "Deploy LMPC website"
   git push heroku main
   ```

### Option 3: Vercel/Netlify
For static hosting, you'll need to modify the backend for serverless functions.

## SSL Certificate

**Important**: Always use HTTPS in production for secure payment processing. Most hosting providers offer free SSL certificates.

## Testing Donations

Use Stripe test cards for testing:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **Requires 3D Secure**: 4000 0000 0000 3220

## Monitoring

Monitor your application:
1. **Stripe Dashboard**: Track payments and issues
2. **Email Delivery**: Monitor email delivery rates
3. **Server Logs**: Check application logs for errors
4. **Database Backups**: Regularly backup your donation data

## Support

For technical support:
1. Check the console for error messages
2. Verify your Stripe configuration
3. Test email delivery
4. Ensure all environment variables are set correctly

## Legal Compliance

1. **PCI Compliance**: Stripe handles PCI compliance for payment processing
2. **Tax Receipts**: Ensure your EIN is correct in email templates
3. **Privacy Policy**: Add a privacy policy for GDPR/CCPA compliance
4. **Terms of Service**: Consider adding terms for online donations

## Backup Strategy

1. **Database**: Regularly backup the SQLite database
2. **Configuration**: Keep your `.env` file secure and backed up
3. **Code**: Use version control (Git) for code backup

Your professional church website with donation processing is now ready to serve your congregation and community!