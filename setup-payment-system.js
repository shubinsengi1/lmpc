#!/usr/bin/env node

/**
 * Payment System Setup Script for LMPCA Website
 * This script helps set up the Stripe payment integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setupPaymentSystem() {
    console.log('\n🏛️  Light Mission Pentecostal Church of Atlanta');
    console.log('💳 Payment System Setup\n');
    console.log('This script will help you configure Stripe payments for your church website.\n');

    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    const envExamplePath = path.join(__dirname, '.env.example');
    
    if (fs.existsSync(envPath)) {
        const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            console.log('Setup cancelled.');
            rl.close();
            return;
        }
    }

    console.log('\n📋 Let\'s gather your configuration details:\n');

    // Stripe Configuration
    console.log('🔧 Stripe Configuration:');
    console.log('You can find these keys in your Stripe Dashboard (https://dashboard.stripe.com/apikeys)\n');
    
    const stripePublishableKey = await question('Stripe Publishable Key (pk_test_... or pk_live_...): ');
    const stripeSecretKey = await question('Stripe Secret Key (sk_test_... or sk_live_...): ');
    
    console.log('\nTo set up webhooks:');
    console.log('1. Go to https://dashboard.stripe.com/webhooks');
    console.log('2. Click "Add endpoint"');
    console.log('3. Set URL to: https://yourdomain.com/api/donations/webhook');
    console.log('4. Select events: payment_intent.succeeded, payment_intent.payment_failed');
    console.log('5. Copy the webhook signing secret\n');
    
    const webhookSecret = await question('Stripe Webhook Secret (whsec_...): ');

    // Email Configuration
    console.log('\n📧 Email Configuration:');
    console.log('For receipt emails, you can use Gmail with an app-specific password.\n');
    
    const emailUser = await question('Church Email Address: ');
    const emailPassword = await question('Email Password (or app-specific password): ');
    
    // Church Information
    console.log('\n🏛️  Church Information:');
    const churchPhone = await question('Church Phone Number [default: (555) 123-4567]: ') || '(555) 123-4567';
    const churchAddress = await question('Church Address [default: 123 Faith Street, Atlanta, GA 30309]: ') || '123 Faith Street, Atlanta, GA 30309';
    const taxId = await question('Federal Tax ID [default: 12-3456789]: ') || '12-3456789';

    // Environment
    const environment = await question('Environment (development/production) [default: development]: ') || 'development';
    const port = await question('Server Port [default: 3000]: ') || '3000';

    // Generate .env file
    const envContent = `# Environment Configuration for LMPCA Website
NODE_ENV=${environment}

# Server Configuration
PORT=${port}
FRONTEND_URL=${environment === 'production' ? 'https://yourdomain.com' : `http://localhost:${port}`}

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_WEBHOOK_SECRET=${webhookSecret}

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=${emailUser}
EMAIL_PASSWORD=${emailPassword}
EMAIL_FROM_NAME=Light Mission Pentecostal Church of Atlanta
EMAIL_FROM_ADDRESS=giving@lmpca.org

# Church Information
CHURCH_NAME=Light Mission Pentecostal Church of Atlanta
CHURCH_ABBREVIATION=LMPCA
CHURCH_ADDRESS=${churchAddress}
CHURCH_PHONE=${churchPhone}
CHURCH_EMAIL=info@lmpca.org
CHURCH_TAX_ID=${taxId}

# Database Configuration
DATABASE_PATH=./data/donations.db

# Security Configuration
SESSION_SECRET=${generateRandomString(64)}
JWT_SECRET=${generateRandomString(32)}

# Rate Limiting
MAX_DONATION_ATTEMPTS_PER_15_MIN=5
MAX_REQUESTS_PER_15_MIN=100

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/application.log
`;

    // Write .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');

    // Update donation.js with correct Stripe key
    updateDonationJS(stripePublishableKey);

    // Create necessary directories
    createDirectories();

    // Display next steps
    console.log('\n🎉 Payment system setup complete!');
    console.log('\n📋 Next Steps:');
    console.log('1. Install dependencies: npm install');
    console.log('2. Test your Stripe keys: npm run test-stripe');
    console.log('3. Start the development server: npm run dev');
    console.log('4. Visit http://localhost:' + port + ' to test your website');
    console.log('5. Test a donation on the /give page');
    console.log('\n⚠️  Security Notes:');
    console.log('- Never commit your .env file to version control');
    console.log('- Use test keys during development');
    console.log('- Set up proper webhook endpoints in production');
    console.log('- Consider using environment variables in production deployment');
    
    rl.close();
}

function updateDonationJS(publishableKey) {
    const donationJSPath = path.join(__dirname, 'donation.js');
    if (fs.existsSync(donationJSPath)) {
        let content = fs.readFileSync(donationJSPath, 'utf8');
        content = content.replace(
            /const stripe = Stripe\('pk_test_.*?'\);/,
            `const stripe = Stripe('${publishableKey}');`
        );
        fs.writeFileSync(donationJSPath, content);
        console.log('✅ Updated donation.js with your Stripe publishable key');
    }
}

function createDirectories() {
    const dirs = ['data', 'logs'];
    dirs.forEach(dir => {
        const dirPath = path.join(__dirname, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`✅ Created directory: ${dir}/`);
        }
    });
}

function generateRandomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Run setup if called directly
if (require.main === module) {
    setupPaymentSystem().catch(console.error);
}

module.exports = { setupPaymentSystem };