import { ConvexReactClient } from 'convex/react';
import { api } from '../../../../packages/backend/convex/_generated/api.js';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export { api, convex };
