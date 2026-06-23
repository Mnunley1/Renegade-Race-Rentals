import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { generateDateRange } from "./dateUtils"
import { ErrorCode, throwError } from "./errors"

async function assertOwnsProfile(
  ctx: any,
  coachProfileId: string,
  userExternalId: string
) {
  const profile = await ctx.db.get(coachProfileId)
  if (!profile) {
    throwError(ErrorCode.NOT_FOUND, "Coach profile not found")
  }
  if (profile.userId !== userExternalId) {
    throwError(ErrorCode.FORBIDDEN, "Not authorized to modify this coach profile")
  }
  return profile
}

export const getByCoach = query({
  args: {
    coachProfileId: v.id("coachProfiles"),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db
      .query("coachAvailability")
      .withIndex("by_coach_date", (idx) => idx.eq("coachProfileId", args.coachProfileId))

    if (args.startDate && args.endDate) {
      const start = args.startDate
      const end = args.endDate
      q = q.filter((f) => f.and(f.gte(f.field("date"), start), f.lte(f.field("date"), end)))
    }

    return await q.order("asc").collect()
  },
})

export const checkAvailability = query({
  args: {
    coachProfileId: v.id("coachProfiles"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const availability = await ctx.db
      .query("coachAvailability")
      .withIndex("by_coach_date", (q) => q.eq("coachProfileId", args.coachProfileId))
      .filter((q) =>
        q.and(q.gte(q.field("date"), args.startDate), q.lte(q.field("date"), args.endDate))
      )
      .collect()

    const blockedDates = availability.filter((a) => !a.isAvailable)

    // Confirmed bookings block the coach's calendar
    const conflictingBookings = await ctx.db
      .query("coachingBookings")
      .withIndex("by_coach_profile", (q) => q.eq("coachProfileId", args.coachProfileId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.and(
            q.lte(q.field("startDate"), args.endDate),
            q.gte(q.field("endDate"), args.startDate)
          )
        )
      )
      .collect()

    return {
      isAvailable: blockedDates.length === 0 && conflictingBookings.length === 0,
      blockedDates,
      conflictingBookings,
    }
  },
})

export const blockDate = mutation({
  args: {
    coachProfileId: v.id("coachProfiles"),
    date: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throwError(ErrorCode.AUTH_REQUIRED, "Not authenticated")
    }
    await assertOwnsProfile(ctx, args.coachProfileId, identity.subject)

    const existing = await ctx.db
      .query("coachAvailability")
      .withIndex("by_coach_date", (q) =>
        q.eq("coachProfileId", args.coachProfileId).eq("date", args.date)
      )
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, {
        isAvailable: false,
        reason: args.reason,
      })
      return existing._id
    }
    return await ctx.db.insert("coachAvailability", {
      coachProfileId: args.coachProfileId,
      date: args.date,
      isAvailable: false,
      reason: args.reason,
      createdAt: Date.now(),
    })
  },
})

export const blockDateRange = mutation({
  args: {
    coachProfileId: v.id("coachProfiles"),
    startDate: v.string(),
    endDate: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throwError(ErrorCode.AUTH_REQUIRED, "Not authenticated")
    }
    await assertOwnsProfile(ctx, args.coachProfileId, identity.subject)

    const dates = generateDateRange(args.startDate, args.endDate)
    return await Promise.all(
      dates.map((date) =>
        ctx.db.insert("coachAvailability", {
          coachProfileId: args.coachProfileId,
          date,
          isAvailable: false,
          reason: args.reason,
          createdAt: Date.now(),
        })
      )
    )
  },
})

export const unblockDate = mutation({
  args: {
    coachProfileId: v.id("coachProfiles"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throwError(ErrorCode.AUTH_REQUIRED, "Not authenticated")
    }
    await assertOwnsProfile(ctx, args.coachProfileId, identity.subject)

    const record = await ctx.db
      .query("coachAvailability")
      .withIndex("by_coach_date", (q) =>
        q.eq("coachProfileId", args.coachProfileId).eq("date", args.date)
      )
      .first()

    if (record) {
      await ctx.db.delete(record._id)
    }
    return record?._id
  },
})

export const unblockDateRange = mutation({
  args: {
    coachProfileId: v.id("coachProfiles"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throwError(ErrorCode.AUTH_REQUIRED, "Not authenticated")
    }
    await assertOwnsProfile(ctx, args.coachProfileId, identity.subject)

    const records = await ctx.db
      .query("coachAvailability")
      .withIndex("by_coach_date", (q) => q.eq("coachProfileId", args.coachProfileId))
      .filter((q) =>
        q.and(q.gte(q.field("date"), args.startDate), q.lte(q.field("date"), args.endDate))
      )
      .collect()

    await Promise.all(records.map((r) => ctx.db.delete(r._id)))
    return records.map((r) => r._id)
  },
})

export const getCalendarData = query({
  args: {
    coachProfileId: v.id("coachProfiles"),
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    const startDate = `${args.year}-${args.month.toString().padStart(2, "0")}-01`
    const lastDay = new Date(args.year, args.month, 0).getDate()
    const endDate = `${args.year}-${args.month.toString().padStart(2, "0")}-${lastDay}`

    const availability = await ctx.db
      .query("coachAvailability")
      .withIndex("by_coach_date", (q) => q.eq("coachProfileId", args.coachProfileId))
      .filter((q) => q.and(q.gte(q.field("date"), startDate), q.lte(q.field("date"), endDate)))
      .collect()

    const bookings = await ctx.db
      .query("coachingBookings")
      .withIndex("by_coach_profile", (q) => q.eq("coachProfileId", args.coachProfileId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "confirmed"),
          q.and(q.lte(q.field("startDate"), endDate), q.gte(q.field("endDate"), startDate))
        )
      )
      .collect()

    return {
      availability,
      bookings,
      startDate,
      endDate,
    }
  },
})
