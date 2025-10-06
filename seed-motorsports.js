#!/usr/bin/env node

/**
 * Seed script for Renegade Motorsports data
 *
 * This script creates fake teams and driver profiles for testing the motorsports page.
 *
 * Usage:
 *   node seed-motorsports.js
 *
 * Make sure Convex is running in development mode first:
 *   pnpm convex:dev
 */

const { ConvexHttpClient } = require('convex/browser');

// Replace with your actual Convex deployment URL
const CONVEX_URL =
  process.env.CONVEX_URL || 'https://earnest-panther-585.convex.cloud';

const client = new ConvexHttpClient(CONVEX_URL);

async function seedMotorsportsData() {
  try {
    console.log('🌱 Seeding motorsports data...');
    console.log('📡 Connecting to Convex:', CONVEX_URL);

    // Run the seed function
    const result = await client.mutation('seedData:seedAll', {});

    console.log('✅ Seed completed successfully!');
    console.log('📊 Results:', {
      tracks: result.tracks,
      users: result.users,
      vehicles: result.vehicles,
      teams: result.teams,
      driverProfiles: result.driverProfiles,
    });

    console.log('\n🏁 Motorsports data seeded:');
    console.log(`   • ${result.teams} racing teams created`);
    console.log(`   • ${result.driverProfiles} driver profiles created`);
    console.log('\n🎯 You can now test the motorsports page at /motorsports');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    console.log('\n💡 Make sure:');
    console.log(
      '   1. Convex is running in development mode (pnpm convex:dev)'
    );
    console.log("   2. You're connected to the correct Convex deployment");
    console.log(
      '   3. The seedData:seedAll function exists in your Convex backend'
    );
  }
}

// Run the seed function
seedMotorsportsData();
