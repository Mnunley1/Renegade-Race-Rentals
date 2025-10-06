import { StripeProvider } from '@stripe/stripe-react-native';

const publishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables',
  );
}

export { publishableKey, StripeProvider };

