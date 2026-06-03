"use client"

import { useUser } from "@clerk/nextjs"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Flag, MessageSquare, Users } from "lucide-react"
import Link from "next/link"

export default function PaddockPage() {
  const { isSignedIn } = useUser()

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="relative overflow-hidden border-2 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <CardContent className="relative space-y-6 p-8 md:p-10">
          <Badge className="px-4 py-1.5 font-semibold text-sm shadow-sm">
            <Flag className="mr-1.5 inline size-4" />
            The Paddock
          </Badge>
          <div className="max-w-2xl space-y-3">
            <h1 className="font-bold text-3xl tracking-tight md:text-4xl">Your digital paddock</h1>
            <p className="text-base text-muted-foreground leading-relaxed md:text-lg">
              A social feed for drivers, teams, and coaches — follow people you race with, see
              endorsements and team updates, and stay close to the deals that matter. The feed is
              coming soon.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/motorsports/drivers">
                <Users className="mr-2 size-4" />
                Browse drivers
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/motorsports">Motorsports network</Link>
            </Button>
            {isSignedIn ? (
              <Button asChild size="lg" variant="outline">
                <Link href="/messages">
                  <MessageSquare className="mr-2 size-4" />
                  Messages
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in?redirect_url=/paddock">Sign in</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
