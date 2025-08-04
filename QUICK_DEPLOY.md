# 🚀 Quick Deploy - LMPC Website

## Deploy in 5 Minutes (Render - Free)

### Step 1: Prepare Your Code
```bash
# Make sure your code is committed to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Render
1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `lmpc-website`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### Step 3: Set Environment Variables
In Render dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
STRIPE_SECRET_KEY=sk_live_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_here
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FROM_EMAIL=donations@lmpc.org
ADMIN_EMAIL=admin@lmpc.org
```

### Step 4: Deploy
Click "Create Web Service" and wait 2-3 minutes.

Your site will be live at: `https://lmpc-website.onrender.com`

## Required Setup

### 1. Stripe Account
- Sign up at [stripe.com](https://stripe.com)
- Get your live API keys from Dashboard → Developers → API Keys
- Set up webhook: `https://your-domain.com/api/donations/webhook`

### 2. Email Setup (Gmail)
- Enable 2FA on Gmail
- Generate app password
- Use that password in EMAIL_PASSWORD

### 3. Update Frontend
Edit `donation.js` line 5:
```javascript
const stripe = Stripe('pk_live_your_actual_key_here');
```

## Test Your Site
- Visit your deployed URL
- Test donation with: `4242 4242 4242 4242`
- Check email receipts are sent

## Need Help?
- See `DEPLOYMENT.md` for detailed instructions
- Check Render logs for errors
- Verify all environment variables are set

🎉 Your church website is now live and accepting donations!