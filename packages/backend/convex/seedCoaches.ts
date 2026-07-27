/**
 * Dev-only seed for the coaches feature. Inserts a handful of sample coach
 * profiles (with fake user records) so the browse + detail pages have real data.
 *
 * Usage:
 *   npx convex run seedCoaches:seed
 *   npx convex run seedCoaches:clear   # remove all seeded fake coaches
 *
 * Idempotent: re-running seed will skip coaches that already exist (keyed by
 * the synthetic externalId prefix "seed_coach_").
 */

import { internalMutation } from "./_generated/server"

const SEED_PREFIX = "seed_coach_"

type SeedCoach = {
  slug: string
  name: string
  email: string
  profileImage?: string
  bio: string
  headline: string
  location: string
  yearsExperience: number
  racingType: "real-world" | "sim-racing" | "both"
  specialties: string[]
  certifications: string[]
  tracksCoachedAt: string[]
  hourlyRate?: number
  halfDayRate?: number
  fullDayRate?: number
}

const SEED_COACHES: SeedCoach[] = [
  {
    slug: "morgan-reyes",
    name: "Morgan Reyes",
    email: "morgan.reyes@example.com",
    bio: "Former IMSA GT3 driver turned full-time coach. I focus on data-driven feedback — bring your data logger and I'll find time on every corner. I've coached drivers from first-time HPDE students through podium-finishing club racers, and my goal is always the same: make you faster and safer.",
    headline: "Ex-IMSA GT3 driver coaching at SCCA, NASA, and PCA events",
    location: "Austin, TX",
    yearsExperience: 12,
    racingType: "real-world",
    specialties: ["HPDE", "GT3", "Time Attack", "Endurance"],
    certifications: ["SCCA Licensed Instructor", "NASA HPDE-4", "PCA Club Race Instructor"],
    tracksCoachedAt: ["Circuit of the Americas", "Eagles Canyon", "MSR Cresson", "NCM Motorsports Park"],
    hourlyRate: 18_000,
    halfDayRate: 60_000,
    fullDayRate: 110_000,
  },
  {
    slug: "sasha-kim",
    name: "Sasha Kim",
    email: "sasha.kim@example.com",
    bio: "Sim-racing pro and real-world karter. I coach iRacing drivers from rookie license up to A class, and I bridge the gap between sim and real-world race craft. Sessions include race-craft analysis, telemetry review, and consistent lap work.",
    headline: "iRacing A-License coach + sim/real-world race craft",
    location: "Los Angeles, CA",
    yearsExperience: 7,
    racingType: "both",
    specialties: ["Sim Racing", "Karting", "Race Craft", "Qualifying"],
    certifications: ["iRacing A-License", "WKA Licensed Instructor"],
    tracksCoachedAt: ["iRacing", "Buttonwillow", "Streets of Willow", "Adams Motorsports Park"],
    hourlyRate: 9000,
    halfDayRate: 32_000,
    fullDayRate: 60_000,
  },
  {
    slug: "ben-walker",
    name: "Ben Walker",
    email: "ben.walker@example.com",
    bio: "Twenty years coaching at the highest levels of club racing. My focus is line theory, braking technique, and how to extract every tenth on tracks you've never seen before. I work best with intermediate and advanced drivers who want to break out of a plateau.",
    headline: "Line theory & advanced braking technique",
    location: "Charlotte, NC",
    yearsExperience: 20,
    racingType: "real-world",
    specialties: ["HPDE", "Time Attack", "Braking Technique", "Line Theory"],
    certifications: ["SCCA Senior Instructor", "Skip Barber Certified"],
    tracksCoachedAt: ["VIR", "Road Atlanta", "Carolina Motorsports Park", "Roebling Road"],
    halfDayRate: 55_000,
    fullDayRate: 100_000,
  },
  {
    slug: "claire-johansen",
    name: "Claire Johansen",
    email: "claire.johansen@example.com",
    bio: "I specialize in first-timer HPDE and women's track days. Patient, methodical, and judgment-free — I'll get you confident on track without ever pushing you past where you should be. Best for new drivers and returners.",
    headline: "Patient HPDE coaching for first-timers & returners",
    location: "Seattle, WA",
    yearsExperience: 9,
    racingType: "real-world",
    specialties: ["HPDE", "Beginner Coaching", "Confidence Building"],
    certifications: ["NASA HPDE-3 Instructor", "PCA Driver Education Instructor"],
    tracksCoachedAt: ["The Ridge Motorsports Park", "Pacific Raceways", "Portland International Raceway"],
    hourlyRate: 12_000,
    fullDayRate: 75_000,
  },
  {
    slug: "andre-okafor",
    name: "Andre Okafor",
    email: "andre.okafor@example.com",
    bio: "Endurance racing specialist. I coach driver-swap teams, communication, traffic management, and night-driving technique. If you're prepping for a 6, 12, or 24-hour event, I can help your team gel and get faster as a unit.",
    headline: "Endurance racing & driver-swap specialist",
    location: "Atlanta, GA",
    yearsExperience: 15,
    racingType: "real-world",
    specialties: ["Endurance", "Driver Coaching", "Night Driving", "Team Strategy"],
    certifications: ["IMSA Coach", "SCCA Pro License"],
    tracksCoachedAt: ["Road Atlanta", "Sebring", "Daytona", "Watkins Glen"],
    hourlyRate: 20_000,
    halfDayRate: 65_000,
    fullDayRate: 120_000,
  },
  {
    slug: "yuki-tanaka",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@example.com",
    bio: "Time Attack specialist with deep setup knowledge. I help drivers and small teams get the most out of a car — coaching is paired with setup notes, tire management strategy, and qualifying simulation work.",
    headline: "Time Attack coaching with setup & tire strategy",
    location: "Phoenix, AZ",
    yearsExperience: 11,
    racingType: "real-world",
    specialties: ["Time Attack", "Setup", "Tire Management", "Qualifying"],
    certifications: ["Global Time Attack Licensed Driver"],
    tracksCoachedAt: ["Inde Motorsports Ranch", "Arizona Motorsports Park", "Buttonwillow", "Streets of Willow"],
    hourlyRate: 15_000,
    halfDayRate: 50_000,
    fullDayRate: 90_000,
  },
]

export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now()
    const inserted: Array<{ slug: string; profileId: string }> = []
    const skipped: string[] = []

    for (const c of SEED_COACHES) {
      const externalId = `${SEED_PREFIX}${c.slug}`

      // Skip if user already exists (idempotent)
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_external_id", (q) => q.eq("externalId", externalId))
        .first()

      let userDocId = existingUser?._id
      if (!userDocId) {
        userDocId = await ctx.db.insert("users", {
          externalId,
          name: c.name,
          email: c.email,
          profileImage: c.profileImage,
          memberSince: new Date(now).toISOString(),
        })
      }

      // Skip if profile already exists for this user
      const existingProfile = await ctx.db
        .query("coachProfiles")
        .withIndex("by_user", (q) => q.eq("userId", externalId))
        .first()

      if (existingProfile) {
        skipped.push(c.slug)
        continue
      }

      const profileId = await ctx.db.insert("coachProfiles", {
        userId: externalId,
        headline: c.headline,
        bio: c.bio,
        yearsExperience: c.yearsExperience,
        specialties: c.specialties,
        certifications: c.certifications,
        tracksCoachedAt: c.tracksCoachedAt,
        racingType: c.racingType,
        hourlyRate: c.hourlyRate,
        halfDayRate: c.halfDayRate,
        fullDayRate: c.fullDayRate,
        location: c.location,
        isActive: true,
        viewCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      inserted.push({ slug: c.slug, profileId })
    }

    return { inserted, skipped }
  },
})

export const clear = internalMutation({
  args: {},
  handler: async (ctx) => {
    const profiles = await ctx.db.query("coachProfiles").collect()
    const users = await ctx.db.query("users").collect()

    let deletedProfiles = 0
    let deletedUsers = 0

    for (const profile of profiles) {
      if (profile.userId.startsWith(SEED_PREFIX)) {
        // Also clean up any availability + bookings tied to this profile
        const avail = await ctx.db
          .query("coachAvailability")
          .withIndex("by_coach_date", (q) => q.eq("coachProfileId", profile._id))
          .collect()
        for (const a of avail) await ctx.db.delete(a._id)

        const bookings = await ctx.db
          .query("coachingBookings")
          .withIndex("by_coach_profile", (q) => q.eq("coachProfileId", profile._id))
          .collect()
        for (const b of bookings) await ctx.db.delete(b._id)

        await ctx.db.delete(profile._id)
        deletedProfiles++
      }
    }

    for (const user of users) {
      if (user.externalId.startsWith(SEED_PREFIX)) {
        await ctx.db.delete(user._id)
        deletedUsers++
      }
    }

    return { deletedProfiles, deletedUsers }
  },
})
