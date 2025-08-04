#!/bin/bash

# LMPC Website Deployment Script
echo "🚀 LMPC Website Deployment Script"
echo "=================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
    echo "🔧 Required variables:"
    echo "   - STRIPE_PUBLISHABLE_KEY"
    echo "   - STRIPE_SECRET_KEY"
    echo "   - STRIPE_WEBHOOK_SECRET"
    echo "   - EMAIL configuration"
    exit 1
fi

# Check if all required environment variables are set
echo "🔍 Checking environment configuration..."

required_vars=(
    "STRIPE_PUBLISHABLE_KEY"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "EMAIL_SERVICE"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "   - $var"
    done
    echo "📝 Please update your .env file and run this script again."
    exit 1
fi

echo "✅ Environment configuration looks good!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Test the application
echo "🧪 Testing the application..."
if npm start &> /dev/null & then
    PID=$!
    sleep 5
    if curl -s http://localhost:3000/api/health > /dev/null; then
        echo "✅ Application is running correctly!"
        kill $PID
    else
        echo "❌ Application failed to start properly."
        kill $PID
        exit 1
    fi
else
    echo "❌ Failed to start application for testing."
    exit 1
fi

echo ""
echo "🎉 Your application is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Choose your deployment platform:"
echo "   - Render (recommended): https://render.com"
echo "   - Railway: https://railway.app"
echo "   - Heroku: https://heroku.com"
echo ""
echo "2. Follow the deployment guide in DEPLOYMENT.md"
echo ""
echo "3. Don't forget to:"
echo "   - Set up your Stripe webhook"
echo "   - Configure your email service"
echo "   - Test the donation form"
echo ""
echo "🔗 For detailed instructions, see DEPLOYMENT.md"