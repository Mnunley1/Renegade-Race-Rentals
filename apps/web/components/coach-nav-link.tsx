"use client"

import { useUser } from "@clerk/nextjs"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "convex/react"
import Link from "next/link"
import { api } from "@/lib/convex"

export function CoachNavLink({ className }: { className?: string }) {
  const { isSignedIn } = useUser()
  const profile = useQuery(api.coachProfiles.getByUser, isSignedIn ? {} : "skip")

  if (!(isSignedIn && profile)) {
    return null
  }

  return (
    <Link
      className={cn(
        "font-medium text-muted-foreground text-sm transition-colors hover:text-foreground",
        className
      )}
      href="/coach/dashboard"
    >
      Coach Dashboard
    </Link>
  )
}
