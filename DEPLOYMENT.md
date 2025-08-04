# Deployment Guide for LMPC Website

This guide will help you deploy your church website online with secure donation processing.

## Quick Deploy Options

### Option 1: Render (Recommended - Free)

1. **Sign up for Render**:
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Connect your repository**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository with your website

3. **Configure the service**:
   - **Name**: `lmpc-website`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Set Environment Variables**:
   Click "Environment" tab and add:
   ```
   NODE_ENV=production
   PORT=10000
   STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   STRIPE_SECRET_KEY=sk_live_your_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook
   EMAIL_SERVICE=smtp
   SMTP_HOST=smtp.your-provider.com
   SMTP_PORT=587
   SMTP_USER=your-email@domain.com
   SMTP_PASSWORD=your-password
   FROM_EMAIL=donations@lmpc.org
   ADMIN_EMAIL=admin@lmpc.org
   ```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Your site will be available at `https://lmpc-website.onrender.com`

### Option 2: Railway (Alternative - Free)

1. **Sign up for Railway**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect it's a Node.js app

3. **Configure Environment Variables**:
   - Go to "Variables" tab
   - Add all the same environment variables as above

4. **Get your URL**:
   - Railway will provide a URL like `https://lmpc-website-production.up.railway.app`

### Option 3: Heroku (Paid)

1. **Install Heroku CLI**:
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and create app**:
   ```bash
   heroku login
   heroku create lmpc-website
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   heroku config:set STRIPE_SECRET_KEY=sk_live_your_key
   # ... add all other variables
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

## Required Setup Before Deployment

### 1. Stripe Configuration

1. **Create Stripe Account**:
   - Go to [stripe.com](https://stripe.com)
   - Sign up and complete verification

2. **Get API Keys**:
   - Go to Developers → API Keys
   - Copy your publishable and secret keys
   - **Important**: Use live keys for production, test keys for development

3. **Set up Webhook**:
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/donations/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the webhook secret

### 2. Email Configuration

**Option A: Gmail (Easy setup)**
1. Enable 2-factor authentication on Gmail
2. Generate app-specific password
3. Use these settings:
   ```
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-specific-password
   ```

**Option B: SMTP Provider (Recommended for production)**
- Use services like SendGrid, Mailgun, or your hosting provider's SMTP
- Configure with your provider's SMTP settings

### 3. Update Frontend Configuration

Update `donation.js` with your Stripe publishable key:
```javascript
const stripe = Stripe('pk_live_your_actual_publishable_key');
```

## Post-Deployment Steps

### 1. Test Your Website
- Visit your deployed URL
- Test the donation form with Stripe test cards:
  - Success: `4242 4242 4242 4242`
  - Decline: `4000 0000 0000 0002`

### 2. Set up Custom Domain (Optional)
- Most platforms support custom domains
- Point your domain's DNS to the platform's servers
- Enable SSL certificate

### 3. Monitor Your Application
- Check application logs for errors
- Monitor Stripe dashboard for payments
- Test email delivery

## Security Checklist

- [ ] Using HTTPS (automatic on most platforms)
- [ ] Environment variables are set (not hardcoded)
- [ ] Stripe webhook is configured
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] Email receipts are being sent

## Troubleshooting

### Common Issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **Environment variables not working**: Verify they're set correctly in your platform
3. **Stripe errors**: Ensure you're using the correct keys (test vs live)
4. **Email not sending**: Check SMTP configuration and credentials

### Getting Help:
- Check platform-specific logs
- Verify all environment variables are set
- Test locally first with `npm start`

## Cost Considerations

- **Render**: Free tier available, $7/month for paid
- **Railway**: Free tier available, pay-as-you-use
- **Heroku**: $7/month minimum
- **Stripe**: 2.9% + 30¢ per transaction
- **Email**: Free with Gmail, $10-20/month for professional services

Your church website is now ready to accept online donations securely!