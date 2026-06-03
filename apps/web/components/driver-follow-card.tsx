"use client"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { useMutation, useQuery } from "convex/react"
import { Loader2, UserCheck, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { QueryErrorBoundary } from "@/components/query-error-boundary"
import { useAuthReady } from "@/hooks/useAuthReady"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"

type DriverFollowCardProps = {
  profileId: Id<"driverProfiles">
}

function DriverFollowCardInner({ profileId }: DriverFollowCardProps) {
  const router = useRouter()
  const { isReady: authReady } = useAuthReady()
  const isFollowing = useQuery(
    api.follows.isFollowing,
    authReady ? { targetType: "driver", targetId: profileId } : "skip"
  )
  const followerCount = useQuery(api.follows.getFollowerCount, {
    targetType: "driver",
    targetId: profileId,
  })
  const followDriver = useMutation(api.follows.follow)
  const unfollowDriver = useMutation(api.follows.unfollow)
  const [isFollowLoading, setIsFollowLoading] = useState(false)

  const handleFollowToggle = async () => {
    if (!authReady) {
      router.push(
        `/sign-in?redirect_url=${encodeURIComponent(`/motorsports/drivers/${profileId}`)}`
      )
      return
    }

    setIsFollowLoading(true)
    try {
      if (isFollowing) {
        await unfollowDriver({ targetType: "driver", targetId: profileId })
        toast.success("Unfollowed driver")
      } else {
        await followDriver({ targetType: "driver", targetId: profileId })
        toast.success("Following driver")
      }
    } catch {
      toast.error("Failed to update follow status")
    } finally {
      setIsFollowLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Button
          className="w-full"
          disabled={isFollowLoading || isFollowing === undefined}
          onClick={handleFollowToggle}
          variant={isFollowing ? "outline" : "default"}
        >
          {(() => {
            if (isFollowLoading) {
              return <Loader2 className="mr-2 size-4 animate-spin" />
            }
            if (isFollowing) {
              return <UserCheck className="mr-2 size-4" />
            }
            return <UserPlus className="mr-2 size-4" />
          })()}
          {isFollowing ? "Following" : "Follow"}
        </Button>
        {followerCount !== undefined && followerCount > 0 && (
          <p className="mt-2 text-center text-muted-foreground text-sm">
            {followerCount} {followerCount === 1 ? "follower" : "followers"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function DriverFollowCard(props: DriverFollowCardProps) {
  return (
    <QueryErrorBoundary>
      <DriverFollowCardInner {...props} />
    </QueryErrorBoundary>
  )
}
