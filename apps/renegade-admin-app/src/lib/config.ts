// apps/renegade-admin-app/src/lib/config.ts
export const adminConfig = {
  convex: {
    url: import.meta.env.VITE_CONVEX_URL || '',
  },
  clerk: {
    publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '',
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '',
  },
  app: {
    name: 'Renegade Race Rentals',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
};
