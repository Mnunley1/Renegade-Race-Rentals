/// <reference types="vite/client" />
import { useAuth } from '@clerk/clerk-react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ReactNode } from 'react';

// Check if we're in development mode and connect to local Convex dev
const isDev = import.meta.env.DEV;
const convexUrl = isDev
  ? 'https://earnest-panther-585.convex.cloud' // Use the deployed URL for development
  : import.meta.env.VITE_CONVEX_URL;

const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Only provide Convex if we have a valid URL
  if (!convex) {
    console.error(
      'Convex client is null - check VITE_CONVEX_URL environment variable'
    );
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
