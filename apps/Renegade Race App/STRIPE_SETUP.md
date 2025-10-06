# Stripe Payment Integration Setup

This document explains how to set up Stripe payment integration for the Renegade Race App.

## Required Environment Variables

### Convex Backend Environment Variables

You need to set these environment variables in your Convex deployment:

```bash
# Set Stripe secret key for server-side operations
npx convex env set STRIPE_SECRET_KEY sk_test_... # Use your Stripe secret key

# Set Stripe webhook secret for webhook verification
npx convex env set STRIPE_WEBHOOK_SECRET whsec_... # Use your Stripe webhook secret
```

### Client-Side Environment Variables

For the React Native app, you need to set:

```bash
# Set Stripe publishable key for client-side operations
npx convex env set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY pk_test_... # Use your Stripe publishable key
```

## Stripe Account Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:
   - Go to your Stripe Dashboard → Developers → API Keys
   - Copy your Publishable key (starts with `pk_test_` or `pk_live_`)
   - Copy your Secret key (starts with `sk_test_` or `sk_live_`)

## Webhook Configuration

1. **Create a Webhook Endpoint**:

   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Set the endpoint URL to: `https://your-convex-deployment.convex.cloud/stripe/webhook`
   - Select these events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.dispute.created`

2. **Get Webhook Secret**:
   - After creating the webhook, click on it
   - Copy the "Signing secret" (starts with `whsec_`)

## Testing

### Test Mode

- Use test keys (starting with `sk_test_` and `pk_test_`)
- Use test card numbers from [Stripe's testing documentation](https://stripe.com/docs/testing)

### Test Card Numbers

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

## Production Setup

When ready for production:

1. **Switch to Live Keys**: Replace test keys with live keys
2. **Update Webhook URL**: Point to your production Convex deployment
3. **Test Thoroughly**: Ensure all payment flows work correctly

## Security Notes

- Never commit secret keys to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor your Stripe dashboard for any suspicious activity

## Troubleshooting

### Common Issues

1. **"Neither apiKey nor config.authenticator provided"**

   - Ensure `STRIPE_SECRET_KEY` is set in Convex environment
   - Verify the key is correct and not empty

2. **Webhook signature verification failed**

   - Ensure `STRIPE_WEBHOOK_SECRET` is set correctly
   - Verify the webhook URL matches your Convex deployment

3. **Client-side Stripe initialization failed**
   - Ensure `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
   - Verify the publishable key is correct

### Verification Commands

```bash
# Check current environment variables
npx convex env list

# Test Convex deployment
npx convex deploy

# Check if Stripe functions are working
npx convex run stripe:initializePlatformSettings
```

## Next Steps

After setting up the environment variables:

1. Deploy your Convex functions: `npx convex deploy`
2. Initialize platform settings: `npx convex run stripe:initializePlatformSettings`
3. Test payment flow with test card numbers
4. Set up webhook endpoint in Stripe dashboard
5. Test webhook integration

## Support

For Stripe-specific issues, refer to:

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)

For Convex-specific issues, refer to:

- [Convex Documentation](https://docs.convex.dev)
- [Convex Discord](https://discord.gg/convex)
