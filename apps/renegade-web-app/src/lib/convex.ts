import { api } from '@renegade/backend';
import { ConvexReactClient } from 'convex/react';
import { webConfig } from './config';

const convex = new ConvexReactClient(webConfig.convex.url);

export { api, convex };
