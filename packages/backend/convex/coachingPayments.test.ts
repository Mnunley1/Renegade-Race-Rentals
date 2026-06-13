// @vitest-environment edge-runtime
import { convexTest } from "convex-test"
import { describe, expect, it, vi } from "vitest"
import { api, internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

// Mock the Stripe SDK so the refund action doesn't reach the network.
const refundsCreate = vi.fn(async () => ({ id: "re_test_123" }))
vi.mock("stripe", () => ({
  default: class {
    refunds = { create: refundsCreate }
  },
}))
process.env.STRIPE_SECRET_KEY = "sk_test_dummy"

const modules = (
  import.meta as unknown as {
    glob: (g: string) => Record<string, () => Promise<unknown>>
  }
).glob("./**/*.ts")

async function seedConfirmableBooking(
  t: ReturnType<typeof convexTest>,
  overrides: Record<string, unknown> = {}
) {
  return await t.run(async (ctx) => {
    const coachProfileId = await ctx.db.insert("coachProfiles", {
      userId: "coach_1",
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
      coachUserId: "coach_1",
      renterId: "renter_1",
      startDate: "2030-01-01",
      endDate: "2030-01-01",
      sessionType: "hourly",
      hours: 2,
      totalDays: 1,
      rate: 15000,
      totalAmount: 30000,
      status: "approved",
      approvedAt: Date.now(),
      paymentStatus: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    })
    return { coachProfileId, bookingId: bookingId as Id<"coachingBookings"> }
  })
}

describe("coaching payments — handlePaymentSuccess", () => {
  it("confirms an approved booking on payment success", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seedConfirmableBooking(t)

    await t.mutation(internal.coachingPayments.handlePaymentSuccess, {
      bookingId,
      stripePaymentIntentId: "pi_test_123",
    })

    await t.finishInProgressScheduledFunctions()
    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(booking?.status).toBe("confirmed")
    expect(booking?.paymentStatus).toBe("paid")
    expect(booking?.stripePaymentIntentId).toBe("pi_test_123")
    expect(booking?.confirmedAt).toBeTruthy()
  })

  it("is idempotent — a second success call leaves the booking confirmed", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seedConfirmableBooking(t)

    await t.mutation(internal.coachingPayments.handlePaymentSuccess, {
      bookingId,
      stripePaymentIntentId: "pi_test_123",
    })
    await t.mutation(internal.coachingPayments.handlePaymentSuccess, {
      bookingId,
      stripePaymentIntentId: "pi_test_123",
    })

    await t.finishInProgressScheduledFunctions()
    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(booking?.status).toBe("confirmed")
  })

  it("marks payment failed without confirming on failure", async () => {
    const t = convexTest(schema, modules)
    const { bookingId } = await seedConfirmableBooking(t)

    await t.mutation(internal.coachingPayments.handlePaymentFailure, {
      bookingId,
      failureReason: "card_declined",
    })

    await t.finishInProgressScheduledFunctions()
    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(booking?.status).toBe("approved")
    expect(booking?.paymentStatus).toBe("failed")
  })

  it("refunds instead of confirming when another booking already holds the dates", async () => {
    vi.useFakeTimers()
    const t = convexTest(schema, modules)
    const { coachProfileId, bookingId } = await seedConfirmableBooking(t)

    // A conflicting confirmed booking for the same coach/dates
    await t.run(async (ctx) => {
      await ctx.db.insert("coachingBookings", {
        coachProfileId,
        coachUserId: "coach_1",
        renterId: "renter_2",
        startDate: "2030-01-01",
        endDate: "2030-01-01",
        sessionType: "hourly",
        hours: 2,
        totalDays: 1,
        rate: 15000,
        totalAmount: 30000,
        status: "confirmed",
        paymentStatus: "paid",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })
    })

    await t.mutation(internal.coachingPayments.handlePaymentSuccess, {
      bookingId,
      stripePaymentIntentId: "pi_test_456",
    })

    // Drain the scheduled refund action (and its nested markRefunded mutation).
    await t.finishAllScheduledFunctions(vi.runAllTimers)
    vi.useRealTimers()

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    // Not confirmed — payment was refunded via the scheduled refund action.
    expect(booking?.status).not.toBe("confirmed")
    expect(refundsCreate).toHaveBeenCalled()
    expect(booking?.paymentStatus).toBe("refunded")
  })
})

async function seedPaidBooking(
  t: ReturnType<typeof convexTest>,
  overrides: Record<string, unknown> = {}
) {
  return (await t.run(async (ctx) => {
    const coachProfileId = await ctx.db.insert("coachProfiles", {
      userId: "coach_1",
      bio: "Test coach",
      specialties: ["HPDE"],
      hourlyRate: 15000,
      location: "Austin, TX",
      isActive: true,
      verificationStatus: "verified",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return await ctx.db.insert("coachingBookings", {
      coachProfileId,
      coachUserId: "coach_1",
      renterId: "renter_1",
      startDate: "2030-09-01",
      endDate: "2030-09-01",
      sessionType: "hourly",
      hours: 2,
      totalDays: 1,
      rate: 15000,
      totalAmount: 30000,
      status: "confirmed",
      paymentStatus: "paid",
      stripePaymentIntentId: "pi_paid_1",
      confirmedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ...overrides,
    })
  })) as Id<"coachingBookings">
}

describe("coaching cancellation refunds", () => {
  it("refunds the renter in full when the coach cancels a paid session", async () => {
    vi.useFakeTimers()
    refundsCreate.mockClear()
    const t = convexTest(schema, modules)
    const bookingId = await seedPaidBooking(t)

    const asCoach = t.withIdentity({ subject: "coach_1" })
    await asCoach.mutation(api.coachingBookings.cancel, { bookingId })

    await t.finishAllScheduledFunctions(vi.runAllTimers)
    vi.useRealTimers()

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(refundsCreate).toHaveBeenCalled()
    expect(booking?.status).toBe("cancelled")
    expect(booking?.paymentStatus).toBe("refunded")
  })

  it("refunds the renter when they cancel with more than 24h notice", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2030-08-01T00:00:00Z"))
    refundsCreate.mockClear()
    const t = convexTest(schema, modules)
    const bookingId = await seedPaidBooking(t, { startDate: "2030-09-01", endDate: "2030-09-01" })

    const asRenter = t.withIdentity({ subject: "renter_1" })
    await asRenter.mutation(api.coachingBookings.cancel, { bookingId })

    await t.finishAllScheduledFunctions(vi.runAllTimers)
    vi.useRealTimers()

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(refundsCreate).toHaveBeenCalled()
    expect(booking?.paymentStatus).toBe("refunded")
  })

  it("does not refund when the renter cancels inside the 24h window", async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2030-09-01T08:00:00Z"))
    refundsCreate.mockClear()
    const t = convexTest(schema, modules)
    const bookingId = await seedPaidBooking(t, {
      startDate: "2030-09-01",
      endDate: "2030-09-01",
      startTime: "10:00",
    })

    const asRenter = t.withIdentity({ subject: "renter_1" })
    await asRenter.mutation(api.coachingBookings.cancel, { bookingId })

    await t.finishAllScheduledFunctions(vi.runAllTimers)
    vi.useRealTimers()

    const booking = await t.run((ctx) => ctx.db.get(bookingId))
    expect(refundsCreate).not.toHaveBeenCalled()
    expect(booking?.status).toBe("cancelled")
    expect(booking?.paymentStatus).toBe("paid")
  })
})
