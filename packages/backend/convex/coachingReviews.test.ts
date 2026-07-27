// @vitest-environment edge-runtime
import { convexTest } from "convex-test"
import { describe, expect, it, vi } from "vitest"
import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
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
const RENTER = "renter_1"

async function seed(
  t: ReturnType<typeof convexTest>,
  bookingStatus: "confirmed" | "completed" = "completed"
) {
  return await t.run(async (ctx) => {
    const coachProfileId = await ctx.db.insert("coachProfiles", {
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
    const bookingId = await ctx.db.insert("coachingBookings", {
      coachProfileId,
      coachUserId: COACH,
      renterId: RENTER,
      startDate: "2030-01-01",
      endDate: "2030-01-01",
      sessionType: "hourly",
      hours: 2,
      totalDays: 1,
      rate: 15000,
      totalAmount: 30000,
      status: bookingStatus,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return {
      coachProfileId,
      bookingId: bookingId as Id<"coachingBookings">,
    }
  })
}

describe("coaching reviews — submit", () => {
  it("creates a review on a completed booking and recalculates the coach rating", async () => {
    vi.useFakeTimers()
    const t = convexTest(schema, modules)
    const { coachProfileId, bookingId } = await seed(t, "completed")

    const asRenter = t.withIdentity({ subject: RENTER })
    await asRenter.mutation(api.coachingReviews.submitReview, {
      bookingId,
      rating: 5,
      communication: 5,
      knowledge: 4,
      title: "Great session",
      review: "Learned a lot about trail braking.",
    })
    // Drain the scheduled recalcCoachRating mutation.
    await t.finishAllScheduledFunctions(vi.runAllTimers)
    vi.useRealTimers()

    const profile = await t.run((ctx) => ctx.db.get(coachProfileId))
    expect(profile?.rating).toBe(5)
    expect(profile?.reviewCount).toBe(1)
  })

  it("rejects reviewing a non-completed booking", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seed(t, "confirmed")

    const asRenter = t.withIdentity({ subject: RENTER })
    await expect(
      asRenter.mutation(api.coachingReviews.submitReview, {
        bookingId,
        rating: 5,
        title: "Too soon",
        review: "Not done yet",
      })
    ).rejects.toThrow()
  })

  it("rejects a non-renter reviewer", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seed(t, "completed")

    const asCoach = t.withIdentity({ subject: COACH })
    await expect(
      asCoach.mutation(api.coachingReviews.submitReview, {
        bookingId,
        rating: 5,
        title: "Self review",
        review: "Cannot review myself",
      })
    ).rejects.toThrow()
  })

  it("allows only one review per booking", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seed(t, "completed")

    const asRenter = t.withIdentity({ subject: RENTER })
    await asRenter.mutation(api.coachingReviews.submitReview, {
      bookingId,
      rating: 5,
      title: "First",
      review: "First review",
    })
    await t.finishInProgressScheduledFunctions()

    await expect(
      asRenter.mutation(api.coachingReviews.submitReview, {
        bookingId,
        rating: 3,
        title: "Second",
        review: "Duplicate review",
      })
    ).rejects.toThrow()
  })

  it("rejects an out-of-range rating", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seed(t, "completed")

    const asRenter = t.withIdentity({ subject: RENTER })
    await expect(
      asRenter.mutation(api.coachingReviews.submitReview, {
        bookingId,
        rating: 9,
        title: "Bad rating",
        review: "Out of range",
      })
    ).rejects.toThrow()
  })
})
