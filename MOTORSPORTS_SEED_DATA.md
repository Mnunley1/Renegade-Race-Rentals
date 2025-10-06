# Motorsports Seed Data

This directory contains seed data for testing the motorsports page functionality.

## What's Included

### 🏁 **5 Racing Teams**

- **Apex Racing Collective** (Los Angeles, CA) - Professional GT3 team
- **Weekend Warriors Racing** (Austin, TX) - Fun-focused track day group
- **Precision Motorsports** (Phoenix, AZ) - Semi-professional endurance team
- **Velocity Racing Team** (Miami, FL) - Professional championship team
- **Thunderbolt Motorsports** (Denver, CO) - Up-and-coming development team

### 🏎️ **6 Driver Profiles**

- **Alex Rodriguez** (Los Angeles, CA) - Professional GT3 driver
- **Sarah Chen** (Austin, TX) - Engineer/racer with technical expertise
- **Michael Thompson** (Phoenix, AZ) - Professional instructor
- **Jessica Martinez** (Miami, FL) - Mechanical engineer/racer
- **Ryan Johnson** (Denver, CO) - Young driver transitioning from karting
- **David Wilson** (Seattle, WA) - Veteran racer and mentor

## How to Seed the Data

### Option 1: Using the Script

```bash
# Make sure Convex is running first
pnpm convex:dev

# In another terminal, run the seed script
pnpm seed:motorsports
```

### Option 2: Manual Convex Function Call

If you have access to the Convex dashboard or CLI:

```bash
# Run the seed function directly
npx convex run seedData:seedAll
```

## Testing the Motorsports Page

After seeding the data, you can test:

1. **Browse Teams**: Visit `/motorsports` and switch to the "Racing Teams" tab
2. **Browse Drivers**: Switch to the "Drivers" tab
3. **Search Functionality**: Try searching for:
   - Team names: "Apex", "Weekend", "Precision"
   - Locations: "Los Angeles", "Austin", "Miami"
   - Specialties: "GT3", "Endurance", "Track Days"
4. **Create New Profiles**: Test the "Create Team" and "Create Driver Profile" buttons
5. **Apply to Teams**: Test the "Apply to Join" functionality

## Clearing Seed Data

To remove all seed data:

```bash
# Run the clear function
npx convex run seedData:clearSeedData
```

## Data Structure

Each team includes:

- Name, description, location
- Racing specialties (GT3, Endurance, etc.)
- Available seats and requirements
- Contact information and social media links

Each driver profile includes:

- Bio and experience level
- Racing licenses and preferred categories
- Availability and location
- Contact information

This seed data provides a realistic testing environment for the motorsports community features! 🏁
