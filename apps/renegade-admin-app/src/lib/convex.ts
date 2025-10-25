import { ConvexReactClient } from 'convex/react';
import { adminConfig } from './config';

const convexUrl = adminConfig.convex.url;
if (!convexUrl) {
  throw new Error('Convex URL is not set in environment variables');
}

export const convex = new ConvexReactClient(convexUrl);
