"use client"

import { useUser } from "@clerk/nextjs"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { useMutation, useQuery } from "convex/react"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0] as string
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export default function CoachAvailabilityPage() {
  const router = useRouter()
  const { isSignedIn, isLoaded } = useUser()
  const profile = useQuery(api.coachProfiles.getByUser)

  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [acting, setActing] = useState(false)

  const calendarData = useQuery(
    api.coachAvailability.getCalendarData,
    profile
      ? {
          coachProfileId: profile._id,
          year: calendarMonth.getFullYear(),
          month: calendarMonth.getMonth() + 1,
        }
      : "skip"
  )

  const blockDate = useMutation(api.coachAvailability.blockDate)
  const unblockDate = useMutation(api.coachAvailability.unblockDate)

  useEffect(() => {
    if (isLoaded && isSignedIn && profile === null) {
      router.push("/coach/onboarding")
    }
  }, [isLoaded, isSignedIn, profile, router])

  const blockedDates = useMemo<Date[]>(() => {
    if (!calendarData) return []
    return calendarData.availability
      .filter((a) => !a.isAvailable)
      .map((a) => new Date(`${a.date}T00:00:00`))
  }, [calendarData])

  const reservedDates = useMemo<Date[]>(() => {
    if (!calendarData) return []
    const dates = new Set<string>()
    for (const b of calendarData.bookings) {
      const start = new Date(`${b.startDate}T00:00:00`)
      const end = new Date(`${b.endDate}T00:00:00`)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.add(formatDateKey(d))
      }
    }
    return Array.from(dates).map((d) => new Date(`${d}T00:00:00`))
  }, [calendarData])

  if (!isLoaded || profile === undefined) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-bold text-2xl">Sign in to manage availability</h1>
        <Button asChild className="mt-6">
          <Link href="/sign-in?redirect_url=/coach/availability">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (profile === null) return null

  const isReserved = (date: Date) => {
    const key = formatDateKey(date)
    return reservedDates.some((d) => formatDateKey(d) === key)
  }

  const isBlocked = (date: Date) => {
    const key = formatDateKey(date)
    return blockedDates.some((d) => formatDateKey(d) === key)
  }

  const handleSelect = async (date: Date | undefined) => {
    if (!(date && profile)) return
    const day = startOfLocalDay(date)
    const today = startOfLocalDay(new Date())
    if (day < today) return
    if (isReserved(day)) {
      toast.info("This date has a confirmed booking and can't be modified")
      return
    }

    const dateKey = formatDateKey(day)
    setActing(true)
    try {
      if (isBlocked(day)) {
        await unblockDate({ coachProfileId: profile._id, date: dateKey })
        toast.success(`${dateKey} is now available`)
      } else {
        await blockDate({ coachProfileId: profile._id, date: dateKey })
        toast.success(`${dateKey} is now blocked`)
      }
    } catch (err) {
      handleErrorWithContext(err, { action: "update availability" })
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Link className="mb-4 inline-block" href="/coach/dashboard">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          Coach dashboard
        </Button>
      </Link>

      <h1 className="mb-2 font-bold text-3xl tracking-tight">Availability</h1>
      <p className="mb-6 text-muted-foreground">
        Click any future date to toggle whether you're available to coach that day.
      </p>

      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
          <CardDescription>
            Confirmed bookings show in blue and can't be changed here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <Calendar
              className="w-full [--cell-size:--spacing(12)]"
              disabled={(date) => {
                const today = startOfLocalDay(new Date())
                const normalized = startOfLocalDay(date)
                return normalized < today || isReserved(normalized) || acting
              }}
              modifiers={{
                blocked: blockedDates,
                reserved: reservedDates,
              }}
              modifiersClassNames={{
                blocked:
                  "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300",
                reserved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
              }}
              month={calendarMonth}
              onDayClick={(day) => handleSelect(day)}
              onMonthChange={setCalendarMonth}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="size-4 rounded border" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-red-100 dark:bg-red-900/20" />
              <span>Blocked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-blue-100 dark:bg-blue-900/20" />
              <span>Booked</span>
            </div>
            {acting && (
              <span className="ml-auto flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                Updating…
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
