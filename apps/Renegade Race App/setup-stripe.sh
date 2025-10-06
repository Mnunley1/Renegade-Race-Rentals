#!/bin/bash

# Stripe Environment Setup Script for Renegade Race App
# This script helps set up the required Stripe environment variables

echo "🔧 Stripe Environment Setup for Renegade Race App"
echo "=================================================="
echo ""

# Check if convex is installed
if ! command -v npx &> /dev/null; then
    echo "❌ Error: npx is not installed. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory."
    exit 1
fi

echo "📋 Required Environment Variables:"
echo "1. STRIPE_SECRET_KEY (server-side operations)"
echo "2. STRIPE_WEBHOOK_SECRET (webhook verification)"
echo "3. EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY (client-side operations)"
echo ""

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_description=$2
    local current_value=$(npx convex env get $var_name 2>/dev/null || echo "")
    
    echo "🔑 Setting $var_name ($var_description)"
    
    if [ -n "$current_value" ]; then
        echo "   Current value: ${current_value:0:20}..."
        read -p "   Do you want to update it? (y/N): " update_choice
        if [[ ! $update_choice =~ ^[Yy]$ ]]; then
            echo "   Skipping $var_name"
            return
        fi
    fi
    
    read -p "   Enter $var_name: " new_value
    
    if [ -n "$new_value" ]; then
        npx convex env set $var_name "$new_value"
        if [ $? -eq 0 ]; then
            echo "   ✅ $var_name set successfully"
        else
            echo "   ❌ Failed to set $var_name"
        fi
    else
        echo "   ⚠️  Skipping $var_name (empty value)"
    fi
    echo ""
}

# Set environment variables
set_env_var "STRIPE_SECRET_KEY" "Your Stripe secret key (starts with sk_test_ or sk_live_)"
set_env_var "STRIPE_WEBHOOK_SECRET" "Your Stripe webhook secret (starts with whsec_)"
set_env_var "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY" "Your Stripe publishable key (starts with pk_test_ or pk_live_)"

echo "🎯 Next Steps:"
echo "1. Deploy your Convex functions: npx convex deploy"
echo "2. Initialize platform settings: npx convex run stripe:initializePlatformSettings"
echo "3. Set up webhook endpoint in your Stripe dashboard"
echo "4. Test payment flow with test card numbers"
echo ""
echo "📚 For detailed instructions, see STRIPE_SETUP.md"
echo ""
echo "✨ Setup complete! Happy coding!"
