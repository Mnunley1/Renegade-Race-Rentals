// Stripe Configuration
import { webConfig } from './config';

export const STRIPE_CONFIG = {
  publishableKey: webConfig.stripe.publishableKey,
};
