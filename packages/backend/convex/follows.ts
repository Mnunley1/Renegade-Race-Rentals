import { v } from "convex/values"
import type { Id } from "./_generated/dataModel"
import { mutation, query } from "./_generated/server"
import { getCurrentUserOrThrow } from "./users"

const targetTypeValidator = v.union(v.literal("driver"), v.literal("team"))

export const follow = mutation({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    if (args.targetType === "driver") {
      const profile = await ctx.db.get(args.targetId as Id<"driverProfiles">)
      if (!profile) {
        throw new Error("Driver profile not found")
      }
      if (profile.userId === user.externalId) {
        throw new Error("Cannot follow yourself")
      }
    } else {
      const team = await ctx.db.get(args.targetId as Id<"teams">)
      if (!team) {
        throw new Error("Team not found")
      }
      if (team.ownerId === user.externalId) {
        throw new Error("Cannot follow your own team")
      }
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_target", (q) =>
        q
          .eq("followerId", user.externalId)
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
      )
      .first()

    if (existing) {
      return existing._id
    }

    return await ctx.db.insert("follows", {
      followerId: user.externalId,
      targetType: args.targetType,
      targetId: args.targetId,
      createdAt: Date.now(),
    })
  },
})

export const unfollow = mutation({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrThrow(ctx)

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_target", (q) =>
        q
          .eq("followerId", user.externalId)
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
      )
      .first()

    if (!existing) {
      return null
    }

    await ctx.db.delete(existing._id)
    return existing._id
  },
})

export const isFollowing = query({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      return false
    }

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_follower_target", (q) =>
        q
          .eq("followerId", identity.subject)
          .eq("targetType", args.targetType)
          .eq("targetId", args.targetId)
      )
      .first()

    return !!existing
  },
})

export const getFollowerCount = query({
  args: {
    targetType: targetTypeValidator,
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    const follows = await ctx.db
      .query("follows")
      .withIndex("by_target", (q) =>
        q.eq("targetType", args.targetType).eq("targetId", args.targetId)
      )
      .collect()

    return follows.length
  },
})
