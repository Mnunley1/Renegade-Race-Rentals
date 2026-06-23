// @vitest-environment edge-runtime
import { convexTest } from "convex-test"
import { describe, expect, it, vi } from "vitest"
import { api } from "./_generated/api"
import schema from "./schema"

vi.mock("./rateLimiter", () => ({
  rateLimiter: { limit: async () => ({ ok: true, retryAfter: 0 }) },
}))

const modules = (
  import.meta as unknown as {
    glob: (g: string) => Record<string, () => Promise<unknown>>
  }
).glob("./**/*.ts")

const COACH = "coach_1"

async function seedProfile(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) =>
    ctx.db.insert("coachProfiles", {
      userId: COACH,
      bio: "Test coach",
      specialties: ["HPDE"],
      hourlyRate: 15000,
      location: "Austin, TX",
      isActive: true,
      verificationStatus: "verified",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  )
}

describe("coach availability", () => {
  it("blocks and unblocks a date, reflected in checkAvailability", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)
    const asCoach = t.withIdentity({ subject: COACH })

    let result = await t.query(api.coachAvailability.checkAvailability, {
      coachProfileId,
      startDate: "2030-05-01",
      endDate: "2030-05-01",
    })
    expect(result.isAvailable).toBe(true)

    await asCoach.mutation(api.coachAvailability.blockDate, {
      coachProfileId,
      date: "2030-05-01",
      reason: "Out of town",
    })

    result = await t.query(api.coachAvailability.checkAvailability, {
      coachProfileId,
      startDate: "2030-05-01",
      endDate: "2030-05-01",
    })
    expect(result.isAvailable).toBe(false)
    expect(result.blockedDates).toHaveLength(1)

    await asCoach.mutation(api.coachAvailability.unblockDate, {
      coachProfileId,
      date: "2030-05-01",
    })

    result = await t.query(api.coachAvailability.checkAvailability, {
      coachProfileId,
      startDate: "2030-05-01",
      endDate: "2030-05-01",
    })
    expect(result.isAvailable).toBe(true)
  })

  it("forbids blocking another coach's calendar", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)

    const asStranger = t.withIdentity({ subject: "someone_else" })
    await expect(
      asStranger.mutation(api.coachAvailability.blockDate, {
        coachProfileId,
        date: "2030-05-01",
      })
    ).rejects.toThrow()
  })

  it("treats a confirmed booking as unavailable", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)

    await t.run(async (ctx) => {
      await ctx.db.insert("coachingBookings", {
        coachProfileId,
        coachUserId: COACH,
        renterId: "renter_1",
        startDate: "2030-06-01",
        endDate: "2030-06-01",
        sessionType: "half_day",
        totalDays: 1,
        rate: 50000,
        totalAmount: 50000,
        status: "confirmed",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    })

    const result = await t.query(api.coachAvailability.checkAvailability, {
      coachProfileId,
      startDate: "2030-06-01",
      endDate: "2030-06-01",
    })
    expect(result.isAvailable).toBe(false)
    expect(result.conflictingBookings).toHaveLength(1)
  })
})
