import { mutation } from './_generated/server';

// Seed function to create fake tracks
export const seedTracks = mutation({
  args: {},
  handler: async ctx => {
    const tracks = [
      {
        name: 'Laguna Seca Raceway',
        location: 'Monterey, CA',
        description:
          'Famous for the Corkscrew turn, this 2.238-mile track offers challenging elevation changes and technical sections.',
        imageUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
        isActive: true,
      },
      {
        name: 'Circuit of the Americas',
        location: 'Austin, TX',
        description:
          'A world-class 3.427-mile circuit featuring 20 turns and hosting Formula 1, MotoGP, and other major racing series.',
        imageUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
        isActive: true,
      },
      {
        name: 'Road America',
        location: 'Elkhart Lake, WI',
        description:
          'A 4.048-mile natural terrain road course known for its fast straights and challenging corners.',
        imageUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
        isActive: true,
      },
      {
        name: 'Watkins Glen International',
        location: 'Watkins Glen, NY',
        description:
          'Historic 3.4-mile circuit with the famous "Boot" section, hosting NASCAR and sports car racing.',
        imageUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
        isActive: true,
      },
      {
        name: 'Sebring International Raceway',
        location: 'Sebring, FL',
        description:
          'A 3.74-mile circuit famous for the 12 Hours of Sebring endurance race.',
        imageUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
        isActive: true,
      },
    ];

    const trackIds = [];
    for (const track of tracks) {
      const trackId = await ctx.db.insert('tracks', track);
      trackIds.push(trackId);
    }

    return trackIds;
  },
});

// Seed function to create fake users
export const seedUsers = mutation({
  args: {},
  handler: async ctx => {
    const users = [
      {
        externalId: 'user_2test_owner1',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1-555-0101',
        rating: 4.8,
        totalRentals: 12,
        memberSince: '2023-01-15',
        profileImage:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        userType: 'both',
      },
      {
        externalId: 'user_2test_owner2',
        name: 'Sarah Chen',
        email: 'sarah.chen@example.com',
        phone: '+1-555-0102',
        rating: 4.9,
        totalRentals: 8,
        memberSince: '2023-03-22',
        profileImage:
          'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        userType: 'both',
      },
      {
        externalId: 'user_2test_owner3',
        name: 'David Rodriguez',
        email: 'david.rodriguez@example.com',
        phone: '+1-555-0103',
        rating: 4.7,
        totalRentals: 15,
        memberSince: '2022-11-08',
        profileImage:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        userType: 'both',
      },
      {
        externalId: 'user_2test_owner4',
        name: 'Emily Watson',
        email: 'emily.watson@example.com',
        phone: '+1-555-0104',
        rating: 4.6,
        totalRentals: 6,
        memberSince: '2023-06-14',
        profileImage:
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        userType: 'both',
      },
      {
        externalId: 'user_2test_owner5',
        name: 'Alex Thompson',
        email: 'alex.thompson@example.com',
        phone: '+1-555-0105',
        rating: 4.9,
        totalRentals: 20,
        memberSince: '2022-08-30',
        profileImage:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        userType: 'both',
      },
    ];

    const userIds = [];
    for (const user of users) {
      const userId = await ctx.db.insert('users', user);
      userIds.push(userId);
    }

    return userIds;
  },
});

// Seed function to create fake vehicles
export const seedVehicles = mutation({
  args: {},
  handler: async ctx => {
    // First, get all tracks and users
    const tracks = await ctx.db.query('tracks').collect();
    const users = await ctx.db.query('users').collect();

    if (tracks.length === 0 || users.length === 0) {
      throw new Error('Please seed tracks and users first');
    }

    const vehicles = [
      {
        trackId: tracks[0]._id, // Laguna Seca
        ownerId: users[0].externalId, // Mike Johnson
        make: 'Porsche',
        model: '911 GT3 RS',
        year: 2023,
        dailyRate: 850,
        description:
          'The ultimate track weapon. This GT3 RS features a 4.0L naturally aspirated flat-6 producing 520 horsepower, with advanced aerodynamics and track-focused suspension.',
        horsepower: 520,
        transmission: 'PDK',
        drivetrain: 'RWD',
        engineType: 'Flat-6',
        mileage: 1200,
        amenities: [
          'Air Conditioning',
          'Premium Audio',
          'Carbon Fiber Interior',
          'Track Telemetry',
          'Data Logger',
        ],
        addOns: [
          {
            name: 'Professional Instruction',
            price: 200,
            description: '1-hour session with certified instructor',
            isRequired: false,
          },
          {
            name: 'Track Insurance',
            price: 150,
            description: 'Comprehensive track day insurance',
            isRequired: true,
          },
          {
            name: 'Helmet Rental',
            price: 50,
            description: 'SA2020 certified racing helmet',
            isRequired: false,
          },
          {
            name: 'Data Logger',
            price: 75,
            description: 'Professional data logging system',
            isRequired: false,
          },
          {
            name: 'GoPro Mount',
            price: 25,
            description: 'Professional camera mounting system',
            isRequired: false,
          },
        ],
        images: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: true,
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: false,
            order: 1,
          },
        ],
      },
      {
        trackId: tracks[1]._id, // Circuit of the Americas
        ownerId: users[1].externalId, // Sarah Chen
        make: 'Ferrari',
        model: '488 GTB',
        year: 2022,
        dailyRate: 1200,
        description:
          'Italian supercar excellence. Twin-turbo V8 producing 661 horsepower with lightning-fast gear changes and race-bred handling.',
        horsepower: 661,
        transmission: '7-Speed DCT',
        drivetrain: 'RWD',
        engineType: 'V8 Twin-Turbo',
        mileage: 800,
        amenities: [
          'Air Conditioning',
          'Premium Audio',
          'Carbon Fiber Interior',
          'Launch Control',
          'Race Mode',
        ],
        addOns: [
          {
            name: 'Professional Instruction',
            price: 250,
            description: '1-hour session with certified instructor',
            isRequired: false,
          },
          {
            name: 'Track Insurance',
            price: 200,
            description: 'Comprehensive track day insurance',
            isRequired: true,
          },
          {
            name: 'Helmet Rental',
            price: 50,
            description: 'SA2020 certified racing helmet',
            isRequired: false,
          },
          {
            name: 'Data Logger',
            price: 75,
            description: 'Professional data logging system',
            isRequired: false,
          },
          {
            name: 'GoPro Mount',
            price: 25,
            description: 'Professional camera mounting system',
            isRequired: false,
          },
        ],
        images: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      {
        trackId: tracks[2]._id, // Road America
        ownerId: users[2].externalId, // David Rodriguez
        make: 'BMW',
        model: 'M4 Competition',
        year: 2023,
        dailyRate: 450,
        description:
          'Precision German engineering meets track performance. 503 horsepower twin-turbo inline-6 with advanced M xDrive all-wheel drive.',
        horsepower: 503,
        transmission: '8-Speed M Steptronic',
        drivetrain: 'AWD',
        engineType: 'Inline-6 Twin-Turbo',
        mileage: 2100,
        amenities: [
          'Air Conditioning',
          'Premium Audio',
          'Carbon Fiber Interior',
          'M Drive Professional',
          'Track Telemetry',
        ],
        addOns: [
          {
            name: 'Professional Instruction',
            price: 150,
            description: '1-hour session with certified instructor',
            isRequired: false,
          },
          {
            name: 'Track Insurance',
            price: 100,
            description: 'Comprehensive track day insurance',
            isRequired: true,
          },
          {
            name: 'Helmet Rental',
            price: 50,
            description: 'SA2020 certified racing helmet',
            isRequired: false,
          },
          {
            name: 'Data Logger',
            price: 75,
            description: 'Professional data logging system',
            isRequired: false,
          },
          {
            name: 'GoPro Mount',
            price: 25,
            description: 'Professional camera mounting system',
            isRequired: false,
          },
        ],
        images: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      {
        trackId: tracks[3]._id, // Watkins Glen
        ownerId: users[3].externalId, // Emily Watson
        make: 'Audi',
        model: 'R8 V10 Performance',
        year: 2022,
        dailyRate: 750,
        description:
          'Mid-engine supercar with a naturally aspirated V10 producing 602 horsepower. Pure driving excitement with quattro all-wheel drive.',
        horsepower: 602,
        transmission: '7-Speed S tronic',
        drivetrain: 'AWD',
        engineType: 'V10',
        mileage: 1500,
        amenities: [
          'Air Conditioning',
          'Premium Audio',
          'Carbon Fiber Interior',
          'Virtual Cockpit',
          'Launch Control',
        ],
        addOns: [
          {
            name: 'Professional Instruction',
            price: 200,
            description: '1-hour session with certified instructor',
            isRequired: false,
          },
          {
            name: 'Track Insurance',
            price: 150,
            description: 'Comprehensive track day insurance',
            isRequired: true,
          },
          {
            name: 'Helmet Rental',
            price: 50,
            description: 'SA2020 certified racing helmet',
            isRequired: false,
          },
          {
            name: 'Data Logger',
            price: 75,
            description: 'Professional data logging system',
            isRequired: false,
          },
          {
            name: 'GoPro Mount',
            price: 25,
            description: 'Professional camera mounting system',
            isRequired: false,
          },
        ],
        images: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      {
        trackId: tracks[4]._id, // Sebring
        ownerId: users[4].externalId, // Alex Thompson
        make: 'McLaren',
        model: '720S',
        year: 2023,
        dailyRate: 1100,
        description:
          'British supercar with a 4.0L twin-turbo V8 producing 710 horsepower. Carbon fiber construction and active aerodynamics.',
        horsepower: 710,
        transmission: '7-Speed SSG',
        drivetrain: 'RWD',
        engineType: 'V8 Twin-Turbo',
        mileage: 900,
        amenities: [
          'Air Conditioning',
          'Premium Audio',
          'Carbon Fiber Interior',
          'Active Aerodynamics',
          'Track Mode',
        ],
        addOns: [
          {
            name: 'Professional Instruction',
            price: 300,
            description: '1-hour session with certified instructor',
            isRequired: false,
          },
          {
            name: 'Track Insurance',
            price: 250,
            description: 'Comprehensive track day insurance',
            isRequired: true,
          },
          {
            name: 'Helmet Rental',
            price: 50,
            description: 'SA2020 certified racing helmet',
            isRequired: false,
          },
          {
            name: 'Data Logger',
            price: 75,
            description: 'Professional data logging system',
            isRequired: false,
          },
          {
            name: 'GoPro Mount',
            price: 25,
            description: 'Professional camera mounting system',
            isRequired: false,
          },
        ],
        images: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      {
        trackId: tracks[0]._id, // Laguna Seca
        ownerId: users[1].externalId, // Sarah Chen
        make: 'Lamborghini',
        model: 'Huracán EVO',
        year: 2022,
        dailyRate: 950,
        description:
          'Italian supercar with a 5.2L naturally aspirated V10 producing 631 horsepower. All-wheel drive and advanced aerodynamics.',
        horsepower: 631,
        transmission: '7-Speed LDF',
        drivetrain: 'AWD',
        engineType: 'V10',
        mileage: 1100,
        amenities: [
          'Air Conditioning',
          'Premium Audio',
          'Carbon Fiber Interior',
          'Launch Control',
          'Race Mode',
        ],
        addOns: [
          {
            name: 'Professional Instruction',
            price: 250,
            description: '1-hour session with certified instructor',
            isRequired: false,
          },
          {
            name: 'Track Insurance',
            price: 200,
            description: 'Comprehensive track day insurance',
            isRequired: true,
          },
          {
            name: 'Helmet Rental',
            price: 50,
            description: 'SA2020 certified racing helmet',
            isRequired: false,
          },
          {
            name: 'Data Logger',
            price: 75,
            description: 'Professional data logging system',
            isRequired: false,
          },
          {
            name: 'GoPro Mount',
            price: 25,
            description: 'Professional camera mounting system',
            isRequired: false,
          },
        ],
        images: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800',
            isPrimary: true,
            order: 0,
          },
        ],
      },
    ];

    const vehicleIds = [];
    for (const vehicle of vehicles) {
      const { images, ...vehicleData } = vehicle;

      // Create the vehicle
      const vehicleId = await ctx.db.insert('vehicles', {
        ...vehicleData,
        isActive: true,
        isApproved: true, // Auto-approve for testing
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Create vehicle images
      for (const image of images) {
        await ctx.db.insert('vehicleImages', {
          vehicleId,
          imageUrl: image.imageUrl,
          isPrimary: image.isPrimary,
          order: image.order,
        });
      }

      vehicleIds.push(vehicleId);
    }

    return vehicleIds;
  },
});

// Complete seed function that runs all seeds in order
export const seedAll = mutation({
  args: {},
  handler: async ctx => {
    console.log('Starting seed process...');

    // Check if data already exists
    const existingTracks = await ctx.db.query('tracks').collect();
    const existingUsers = await ctx.db.query('users').collect();
    const existingVehicles = await ctx.db.query('vehicles').collect();

    if (
      existingTracks.length > 0 ||
      existingUsers.length > 0 ||
      existingVehicles.length > 0
    ) {
      console.log('Data already exists. Skipping seed.');
      return {
        message: 'Data already exists. Skipping seed.',
        tracks: existingTracks.length,
        users: existingUsers.length,
        vehicles: existingVehicles.length,
      };
    }

    // Seed in order: tracks -> users -> vehicles
    console.log('Seeding tracks...');
    const trackIds = await ctx.runMutation('seedData:seedTracks', {});

    console.log('Seeding users...');
    const userIds = await ctx.runMutation('seedData:seedUsers', {});

    console.log('Seeding vehicles...');
    const vehicleIds = await ctx.runMutation('seedData:seedVehicles', {});

    // Create fake teams
    const teamIds = [];
    const teams = [
      {
        name: 'Apex Racing Collective',
        description:
          'Competitive racing team focused on GT3 championships and endurance racing. We have a strong track record in professional motorsports and are looking for skilled drivers to join our championship-winning team.',
        logoUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
        location: 'Los Angeles, CA',
        specialties: ['GT3', 'Time Attack', 'Endurance'],
        availableSeats: 2,
        requirements: [
          'SCCA license required',
          '3+ years racing experience',
          'Clean driving record',
        ],
        contactInfo: {
          phone: '(555) 123-4567',
          email: 'contact@apexracing.com',
          website: 'https://apexracing.com',
        },
        socialLinks: {
          instagram: '@apexracing',
          twitter: '@apexracing',
          facebook: 'Apex Racing Collective',
          linkedin: 'Apex Racing Collective',
        },
      },
      {
        name: 'Weekend Warriors Racing',
        description:
          'Fun-focused group for weekend track enthusiasts. We believe racing should be accessible to everyone and focus on building a supportive community of drivers at all skill levels.',
        logoUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
        location: 'Austin, TX',
        specialties: ['Track Days', 'HPDE', 'Autocross'],
        availableSeats: 4,
        requirements: ['Clean driving record', 'Basic safety equipment'],
        contactInfo: {
          phone: '(555) 987-6543',
          email: 'info@weekendwarriors.com',
          website: 'https://weekendwarriors.com',
        },
        socialLinks: {
          instagram: '@weekendwarriors',
          twitter: '@weekendwarriors',
        },
      },
      {
        name: 'Precision Motorsports',
        description:
          'Semi-professional team competing in endurance events and circuit racing. We focus on precision driving, data analysis, and continuous improvement in our racing program.',
        logoUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
        location: 'Phoenix, AZ',
        specialties: ['Endurance', 'Circuit Racing', 'Data Analysis'],
        availableSeats: 1,
        requirements: [
          'Racing license preferred',
          '2+ years track experience',
          'Commitment to team development',
        ],
        contactInfo: {
          phone: '(555) 456-7890',
          email: 'team@precisionmotorsports.com',
          website: 'https://precisionmotorsports.com',
        },
        socialLinks: {
          instagram: '@precisionmotorsports',
          linkedin: 'Precision Motorsports',
        },
      },
      {
        name: 'Velocity Racing Team',
        description:
          'Professional racing team with championship experience in multiple series. We provide comprehensive support including coaching, data analysis, and professional-grade equipment.',
        logoUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
        location: 'Miami, FL',
        specialties: ['Formula Racing', 'GT3', 'Professional Coaching'],
        availableSeats: 3,
        requirements: [
          'Professional racing license',
          '5+ years experience',
          'Championship experience preferred',
        ],
        contactInfo: {
          phone: '(555) 321-0987',
          email: 'recruiting@velocityracing.com',
          website: 'https://velocityracing.com',
        },
        socialLinks: {
          instagram: '@velocityracing',
          twitter: '@velocityracing',
          linkedin: 'Velocity Racing Team',
        },
      },
      {
        name: 'Thunderbolt Motorsports',
        description:
          'Up-and-coming team focused on developing young talent and competing in regional championships. We offer mentorship and growth opportunities for drivers looking to advance their careers.',
        logoUrl:
          'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=200',
        location: 'Denver, CO',
        specialties: [
          'Regional Championships',
          'Driver Development',
          'Mentorship',
        ],
        availableSeats: 2,
        requirements: [
          '1+ years racing experience',
          'Commitment to learning',
          'Team player attitude',
        ],
        contactInfo: {
          phone: '(555) 654-3210',
          email: 'join@thunderboltmotorsports.com',
        },
        socialLinks: {
          instagram: '@thunderboltmotorsports',
          facebook: 'Thunderbolt Motorsports',
        },
      },
    ];

    for (const team of teams) {
      const teamId = await ctx.db.insert('teams', {
        ...team,
        ownerId: 'seed-team-owner', // Using a fake owner ID for seed data
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      teamIds.push(teamId);
    }

    // Create fake driver profiles
    const driverProfileIds = [];
    const driverProfiles = [
      {
        bio: 'Experienced track driver with multiple championship wins in regional GT3 series. Passionate about precision driving and team collaboration. Looking for a competitive team to join for the upcoming season.',
        experience: 'professional',
        licenses: ['SCCA Pro', 'FIA', 'NASA'],
        preferredCategories: ['GT3', 'Endurance', 'Time Attack'],
        availability: ['weekends', 'weekdays', 'evenings'],
        location: 'Los Angeles, CA',
        contactInfo: {
          phone: '(555) 111-2222',
          email: 'alex.rodriguez@email.com',
        },
      },
      {
        bio: 'Engineer by day, racer by weekend. Passionate about precision driving and car setup. I bring technical expertise and analytical thinking to racing, with experience in data analysis and vehicle dynamics.',
        experience: 'intermediate',
        licenses: ['SCCA', 'NASA'],
        preferredCategories: ['Time Attack', 'Endurance', 'Circuit Racing'],
        availability: ['weekends', 'evenings'],
        location: 'Austin, TX',
        contactInfo: {
          phone: '(555) 333-4444',
          email: 'sarah.chen@email.com',
        },
      },
      {
        bio: 'Professional instructor and competitive driver seeking new racing opportunities. With 7+ years of experience, I specialize in driver coaching and competitive racing across multiple disciplines.',
        experience: 'professional',
        licenses: ['FIA', 'SCCA Pro', 'NASA Pro'],
        preferredCategories: ['Drift', 'Circuit Racing', 'Instructor'],
        availability: ['weekends', 'weekdays'],
        location: 'Phoenix, AZ',
        contactInfo: {
          phone: '(555) 555-6666',
          email: 'michael.thompson@email.com',
        },
      },
      {
        bio: 'Racing enthusiast with a background in mechanical engineering. I love the technical aspects of racing and enjoy working on car setup and optimization. Looking to join a team that values both performance and learning.',
        experience: 'advanced',
        licenses: ['SCCA', 'NASA'],
        preferredCategories: [
          'Circuit Racing',
          'Time Attack',
          'Technical Development',
        ],
        availability: ['weekends'],
        location: 'Miami, FL',
        contactInfo: {
          phone: '(555) 777-8888',
          email: 'jessica.martinez@email.com',
        },
      },
      {
        bio: 'Young driver with 3 years of karting experience transitioning to car racing. Highly motivated and eager to learn from experienced team members. I bring enthusiasm and dedication to every race.',
        experience: 'beginner',
        licenses: ['SCCA Novice'],
        preferredCategories: [
          'Circuit Racing',
          'Track Days',
          'Driver Development',
        ],
        availability: ['weekends', 'summer break'],
        location: 'Denver, CO',
        contactInfo: {
          phone: '(555) 999-0000',
          email: 'ryan.johnson@email.com',
        },
      },
      {
        bio: 'Veteran racer with 15+ years of experience across multiple racing disciplines. Former professional driver now looking to mentor younger drivers while continuing to compete at a high level.',
        experience: 'professional',
        licenses: ['FIA Pro', 'SCCA Pro', 'IMSA'],
        preferredCategories: ['Endurance', 'GT3', 'Mentorship'],
        availability: ['weekends', 'weekdays'],
        location: 'Seattle, WA',
        contactInfo: {
          phone: '(555) 123-9999',
          email: 'david.wilson@email.com',
        },
      },
    ];

    for (const profile of driverProfiles) {
      const profileId = await ctx.db.insert('driverProfiles', {
        ...profile,
        userId: 'seed-driver-user', // Using a fake user ID for seed data
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      driverProfileIds.push(profileId);
    }

    console.log('Seed process completed!');

    return {
      message: 'Seed process completed successfully!',
      tracks: trackIds.length,
      users: userIds.length,
      vehicles: vehicleIds.length,
      teams: teamIds.length,
      driverProfiles: driverProfileIds.length,
      trackIds,
      userIds,
      vehicleIds,
      teamIds,
      driverProfileIds,
    };
  },
});

// Clear all seed data
export const clearSeedData = mutation({
  args: {},
  handler: async ctx => {
    console.log('Clearing seed data...');

    // Delete in reverse order to avoid foreign key constraints
    const vehicles = await ctx.db.query('vehicles').collect();
    for (const vehicle of vehicles) {
      // Delete vehicle images first
      const images = await ctx.db
        .query('vehicleImages')
        .withIndex('by_vehicle', q => q.eq('vehicleId', vehicle._id))
        .collect();

      for (const image of images) {
        await ctx.db.delete(image._id);
      }

      // Delete the vehicle
      await ctx.db.delete(vehicle._id);
    }

    // Delete team applications first (they reference teams)
    const teamApplications = await ctx.db.query('teamApplications').collect();
    for (const application of teamApplications) {
      await ctx.db.delete(application._id);
    }

    // Delete teams
    const teams = await ctx.db.query('teams').collect();
    for (const team of teams) {
      await ctx.db.delete(team._id);
    }

    // Delete driver profiles
    const driverProfiles = await ctx.db.query('driverProfiles').collect();
    for (const profile of driverProfiles) {
      await ctx.db.delete(profile._id);
    }

    const users = await ctx.db.query('users').collect();
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    const tracks = await ctx.db.query('tracks').collect();
    for (const track of tracks) {
      await ctx.db.delete(track._id);
    }

    console.log('Seed data cleared!');

    return {
      message: 'Seed data cleared successfully!',
      deletedTracks: tracks.length,
      deletedUsers: users.length,
      deletedVehicles: vehicles.length,
      deletedTeams: teams.length,
      deletedDriverProfiles: driverProfiles.length,
      deletedTeamApplications: teamApplications.length,
    };
  },
});
