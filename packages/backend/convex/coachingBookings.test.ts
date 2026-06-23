// @vitest-environment edge-runtime
import { convexTest } from "convex-test"
import { describe, expect, it, vi } from "vitest"
import { api } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

// The rate-limiter component isn't registered in convex-test; stub it to a no-op.
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

async function seedProfile(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) =>
    ctx.db.insert("coachProfiles", {
      userId: COACH,
      bio: "Test coach",
      specialties: ["HPDE"],
      hourlyRate: 15000,
      halfDayRate: 50000,
      fullDayRate: 90000,
      location: "Austin, TX",
      isActive: true,
      verificationStatus: "verified",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
  )
}

async function seedBooking(
  t: ReturnType<typeof convexTest>,
  coachProfileId: Id<"coachProfiles">,
  overrides: Record<string, unknown> = {}
) {
  return (await t.run(async (ctx) =>
    ctx.db.insert("coachingBookings", {
      coachProfileId,
      coachUserId: COACH,
      renterId: RENTER,
      startDate: "2030-03-01",
      endDate: "2030-03-01",
      sessionType: "half_day",
      totalDays: 1,
      rate: 50000,
      totalAmount: 50000,
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    })
  )) as Id<"coachingBookings">
}

describe("coaching bookings — create", () => {
  it("creates a pending booking for an active coach", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)

    const asRenter = t.withIdentity({ subject: RENTER })
    const bookingId = await asRenter.mutation(api.coachingBookings.create, {
      coachProfileId,
      sessionType: "half_day",
      startDate: "2030-03-01",
      endDate: "2030-03-01",
    })

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(booking?.status).toBe("pending")
    expect(booking?.totalAmount).toBe(50000)
  })

  it("rejects booking yourself as a coach", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)

    const asCoach = t.withIdentity({ subject: COACH })
    await expect(
      asCoach.mutation(api.coachingBookings.create, {
        coachProfileId,
        sessionType: "half_day",
        startDate: "2030-03-01",
        endDate: "2030-03-01",
      })
    ).rejects.toThrow()
  })
})

describe("coaching bookings — approve / complete", () => {
  it("lets the coach approve a pending booking and auto-declines overlapping pending ones", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)
    const target = await seedBooking(t, coachProfileId)
    const overlapping = await seedBooking(t, coachProfileId, { renterId: "renter_2" })

    const asCoach = t.withIdentity({ subject: COACH })
    await asCoach.mutation(api.coachingBookings.approve, { bookingId: target })
    await t.finishInProgressScheduledFunctions()

    const approved = await t.run((ctx) => ctx.db.get(target))
    const declined = await t.run((ctx) => ctx.db.get(overlapping))
    expect(approved?.status).toBe("approved")
    expect(declined?.status).toBe("declined")
  })

  it("forbids a non-coach from approving", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)
    const bookingId = await seedBooking(t, coachProfileId)

    const asRenter = t.withIdentity({ subject: RENTER })
    await expect(
      asRenter.mutation(api.coachingBookings.approve, { bookingId })
    ).rejects.toThrow()
  })

  it("only allows completing a confirmed booking, by the coach", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)
    const bookingId = await seedBooking(t, coachProfileId, { status: "confirmed" })

    const asRenter = t.withIdentity({ subject: RENTER })
    await expect(
      asRenter.mutation(api.coachingBookings.complete, { bookingId })
    ).rejects.toThrow()

    const asCoach = t.withIdentity({ subject: COACH })
    await asCoach.mutation(api.coachingBookings.complete, { bookingId })
    await t.finishInProgressScheduledFunctions()

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(booking?.status).toBe("completed")
  })
})

describe("coaching bookings — reportIssue", () => {
  it("flags a confirmed booking and blocks duplicate reports", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)
    const bookingId = await seedBooking(t, coachProfileId, { status: "confirmed" })

    const asRenter = t.withIdentity({ subject: RENTER })
    await asRenter.mutation(api.coachingBookings.reportIssue, {
      bookingId,
      reason: "Coach did not show up",
    })
    await t.finishInProgressScheduledFunctions()

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(booking?.disputeStatus).toBe("open")
    expect(booking?.issueReportedBy).toBe(RENTER)

    await expect(
      asRenter.mutation(api.coachingBookings.reportIssue, {
        bookingId,
        reason: "again",
      })
    ).rejects.toThrow()
  })

  it("rejects reporting on a non-confirmed/completed booking", async () => {
    const t = convexTest(schema, modules)
    const coachProfileId = await seedProfile(t)
    const bookingId = await seedBooking(t, coachProfileId, { status: "pending" })

    const asRenter = t.withIdentity({ subject: RENTER })
    await expect(
      asRenter.mutation(api.coachingBookings.reportIssue, {
        bookingId,
        reason: "too early",
      })
    ).rejects.toThrow()
  })
})
