// Stripe Configuration
// Replace with your actual Stripe publishable key from https://dashboard.stripe.com/apikeys
export const STRIPE_CONFIG = {
  publishableKey:
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_your_stripe_publishable_key_here',
};
