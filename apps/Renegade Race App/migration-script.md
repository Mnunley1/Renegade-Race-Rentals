// Migration script to fix vehicle images schema issue
// Run this in your Convex dashboard or via the CLI

import { api } from './\_generated/api';
import { useMutation } from 'convex/react';

// This function will fix existing vehicle images that don't have storageId
export const fixVehicleImages = useMutation(api.vehicles.migrateVehicleImages);

// Usage:
// 1. Open your app
// 2. In the browser console, run: fixVehicleImages()
// 3. Check the console for migration results

