import { useUser } from "@clerk/nextjs"
import { useConvexAuth } from "convex/react"

/**
 * True when Clerk and Convex auth are both ready — safe to call Convex queries
 * that use ctx.auth.getUserIdentity().
 */
export function useAuthReady() {
  const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth()
  const { user, isSignedIn, isLoaded: clerkLoaded } = useUser()

  const isReady = clerkLoaded && !convexAuthLoading && isSignedIn && isAuthenticated && !!user?.id

  return {
    isReady,
    userId: isReady ? user.id : null,
    user,
    isSignedIn,
    clerkLoaded,
    convexAuthLoading,
    isAuthenticated,
  }
}
