# 💳 Church Payment System Setup Guide

Your church website now has a complete payment backend! Here's everything you need to know to get it running.

## 🎯 What You Now Have

### ✅ Complete Payment System
- **Frontend**: Beautiful donation form on your Give page
- **Backend**: Secure Node.js server with Stripe integration
- **Email**: Automatic receipts and notifications
- **Security**: PCI-compliant payment processing

### ✅ Key Features
- Multiple donation types (General, Missions, Building, etc.)
- Secure credit card processing via Stripe
- Automatic email receipts to donors
- Admin notifications for new donations
- Contact form with email backend
- Mobile-responsive donation forms

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Your Stripe Account
1. Go to [stripe.com](https://stripe.com) and create a free account
2. Go to [API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your **Test** keys (start with `pk_test_` and `sk_test_`)

### Step 2: Setup Email
1. Enable 2-Factor Authentication on your Gmail account
2. Create an [App Password](https://myaccount.google.com/apppasswords)
3. Select "Mail" and copy the generated password

### Step 3: Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your keys
npm install
npm run dev
```

### Step 4: Update Frontend
Edit `payment.js` line 23 with your Stripe publishable key:
```javascript
const publishableKey = 'pk_test_your_actual_key_here';
```

### Step 5: Test It!
1. Open `give.html` in your browser
2. Scroll to the donation form
3. Use test card: `4242 4242 4242 4242`
4. Check your email for receipt!

## 🔧 Environment Variables (.env file)

```env
# Required for payments
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Required for emails
EMAIL_USER=your-church-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CHURCH_EMAIL=admin@lmpc.org

# Server settings
PORT=3000
FRONTEND_URL=http://localhost:8000
```

## 🌐 Deployment Options

### Option 1: Heroku (Easiest)
```bash
# Install Heroku CLI and login
heroku create your-church-payments
heroku config:set STRIPE_SECRET_KEY=sk_test_your_key
heroku config:set EMAIL_USER=your-email@gmail.com
# ... set all other variables
git subtree push --prefix backend heroku main
```

### Option 2: Railway (Simple)
1. Connect GitHub to [Railway](https://railway.app)
2. Select your backend folder
3. Add environment variables
4. Deploy!

### Option 3: Your Own Server
```bash
# On your server
git clone your-repo
cd backend
npm install --production
npm start
```

## 💰 Test Credit Cards (For Development)

| Card Number | Brand | Use Case |
|-------------|-------|----------|
| 4242424242424242 | Visa | Successful payment |
| 4000000000000002 | Visa | Card declined |
| 4000000000009995 | Visa | Insufficient funds |

**Use any future expiry date and any 3-digit CVC**

## 📧 How Emails Work

### When Someone Donates:
1. **Donor** receives beautiful HTML receipt with:
   - Donation amount and type
   - Transaction ID for records
   - Tax-deductible information
   - Church contact details

2. **Church** receives notification with:
   - Donor name and email
   - Donation amount and type
   - Date and transaction ID

### Contact Form Emails:
- All contact form submissions are emailed to church
- Includes sender's info and message
- Automatic reply confirmation to sender

## 🔒 Security Features

✅ **PCI Compliance**: Stripe handles all card data
✅ **Rate Limiting**: Prevents spam and abuse
✅ **Input Validation**: All data is validated
✅ **Secure Headers**: Helmet.js for security headers
✅ **CORS Protection**: Prevents unauthorized access
✅ **Webhook Verification**: Stripe signature validation

## 🐛 Common Issues & Solutions

### "Payment form not loading"
- Check that backend is running (`npm run dev`)
- Verify Stripe publishable key in `payment.js`
- Look at browser console for errors

### "Emails not sending"
- Use Gmail app password, not regular password
- Enable 2-Factor Authentication first
- Check spam folder for test emails

### "CORS errors"
- Make sure `FRONTEND_URL` matches your website URL
- Update CORS settings in `server.js` if needed

### "Webhook not working"
- Set up webhook endpoint in Stripe dashboard
- Use ngrok for local testing: `ngrok http 3000`
- Copy webhook secret to environment variables

## 💡 Going Live Checklist

### Switch to Live Mode:
1. **Business Verification**: Complete Stripe business verification
2. **Live Keys**: Replace test keys with live keys
3. **Webhook URL**: Update webhook to production URL
4. **Domain**: Point custom domain to your backend
5. **SSL**: Ensure HTTPS is enabled
6. **Test Donation**: Make small real donation to test

### Production Environment Variables:
```env
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
FRONTEND_URL=https://your-church-website.com
NODE_ENV=production
```

## 📊 Stripe Fees

- **2.9% + 30¢** per successful transaction
- **No monthly fees** or setup costs
- Automatic deposits to your bank account
- Detailed reporting and analytics

## 📈 Monitoring Your Donations

### Stripe Dashboard
- Real-time payment monitoring
- Financial reports and analytics
- Failed payment notifications
- Dispute management

### Your Backend Logs
```bash
# View application logs
npm run dev  # Shows live logs
heroku logs --tail  # For Heroku deployment
```

## 🎨 Customization

### Donation Types
Edit `server.js` around line 310 to modify donation categories:
```javascript
{ id: 'special', name: 'Special Campaign', description: 'Support our building project' }
```

### Email Templates
Modify email templates in `server.js` around lines 180-250 for custom branding and messaging.

### Form Styling
Update `payment.js` styles section to match your church branding.

## 📞 Support & Help

### Stripe Support
- **Documentation**: [stripe.com/docs](https://stripe.com/docs)
- **Support**: Available 24/7 for paid accounts

### Technical Support
- Check the backend `README.md` for detailed setup
- GitHub issues for bug reports
- Contact form on your website for general questions

## 🎉 You're All Set!

Your church now has a professional-grade payment system that's:
- ✅ Secure and PCI-compliant
- ✅ Mobile-friendly
- ✅ Easy to use for donors
- ✅ Automatically sends receipts
- ✅ Provides detailed reporting

**Happy giving!** 🙏

---

*Need help? Contact us through the church website or check the detailed backend documentation.*