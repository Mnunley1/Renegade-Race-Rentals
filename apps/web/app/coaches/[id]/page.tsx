"use client"

import { useUser } from "@clerk/nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Calendar, type DateRange } from "@workspace/ui/components/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { useMutation, useQuery } from "convex/react"
import {
  ArrowLeft,
  Award,
  CalendarDays,
  Edit,
  Eye,
  EyeOff,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Star,
  Trophy,
  Twitter,
  User,
} from "lucide-react"
import Link from "next/link"
import { use, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { CoachBookingDialog } from "@/components/coach-booking-dialog"
import { CoachContactDialog } from "@/components/coach-contact-dialog"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"

type Props = {
  params: Promise<{ id: string }>
}

function formatCents(cents?: number) {
  if (cents === undefined) return null
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function fmtShort(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function fmtLong(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

// Static so the Calendar receives a stable prop and doesn't re-render on hover.
const MODIFIER_CLASSES = {
  blocked: "text-muted-foreground line-through",
  reserved: "text-muted-foreground line-through",
}

function socialUrl(prefix: string, value: string) {
  if (value.startsWith("http")) return value
  if (value.startsWith("@")) return `${prefix}${value.slice(1)}`
  return `${prefix}${value}`
}

export default function CoachDetailPage({ params }: Props) {
  const { id } = use(params)
  const coachId = id as Id<"coachProfiles">
  const { isSignedIn } = useUser()

  const coach = useQuery(api.coachProfiles.getById, { profileId: coachId })

  const [bookingOpen, setBookingOpen] = useState(false)
  const [range, setRange] = useState<DateRange | undefined>()
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const calendarData = useQuery(
    api.coachAvailability.getCalendarData,
    coach && !coach.isOwner
      ? {
          coachProfileId: coachId,
          year: calendarMonth.getFullYear(),
          month: calendarMonth.getMonth() + 1,
        }
      : "skip"
  )

  const reviews = useQuery(
    api.reviews.getByUser,
    coach ? { userId: coach.userId, role: "reviewed" } : "skip"
  )

  const incrementView = useMutation(api.coachProfiles.incrementViewCount)
  const toggleVisibility = useMutation(api.coachProfiles.toggleVisibility)
  const [contactOpen, setContactOpen] = useState(false)

  // Count the view exactly once per visit. Guarded by a ref because
  // incrementView mutates viewCount, which changes `coach` and would otherwise
  // re-trigger this effect in an infinite loop (re-rendering the whole page).
  const viewCounted = useRef(false)
  useEffect(() => {
    if (coach && !coach.isOwner && !viewCounted.current) {
      viewCounted.current = true
      incrementView({ profileId: coachId }).catch(() => {
        // best-effort view tracking
      })
    }
  }, [coach, coachId, incrementView])

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return null
    const total = reviews.reduce((sum, r) => sum + r.rating, 0)
    return total / reviews.length
  }, [reviews])

  // Dates the coach has marked unavailable, and dates held by confirmed bookings.
  const blockedDates = useMemo<Date[]>(() => {
    if (!calendarData) return []
    return calendarData.availability
      .filter((a) => !a.isAvailable)
      .map((a) => new Date(`${a.date}T00:00:00`))
  }, [calendarData])

  const reservedDates = useMemo<Date[]>(() => {
    if (!calendarData) return []
    const out: Date[] = []
    for (const b of calendarData.bookings) {
      const start = new Date(`${b.startDate}T00:00:00`)
      const end = new Date(`${b.endDate}T00:00:00`)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        out.push(startOfLocalDay(d))
      }
    }
    return out
  }, [calendarData])

  // Fast lookup for unavailable days, shared by the `disabled` matcher and the
  // range-selection guard below.
  const unavailableKeys = useMemo(() => {
    const keys = new Set<string>()
    for (const d of blockedDates) keys.add(d.toDateString())
    for (const d of reservedDates) keys.add(d.toDateString())
    return keys
  }, [blockedDates, reservedDates])

  // Stable identities so react-day-picker doesn't re-render the day cells (which
  // is what made the hover state flicker).
  const isDisabledDay = useCallback(
    (date: Date) => {
      const day = startOfLocalDay(date)
      return day < startOfLocalDay(new Date()) || unavailableKeys.has(day.toDateString())
    },
    [unavailableKeys]
  )
  const modifiers = useMemo(
    () => ({ blocked: blockedDates, reserved: reservedDates }),
    [blockedDates, reservedDates]
  )

  const handleToggleVisibility = async () => {
    try {
      const result = await toggleVisibility({ profileId: coachId })
      toast.success(result ? "Profile is now visible" : "Profile hidden")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update profile")
    }
  }

  if (coach === undefined) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-8 w-32" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-64 md:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (coach === null) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="font-bold text-2xl">Coach not found</h1>
        <p className="mt-2 text-muted-foreground">This profile may have been removed.</p>
        <Button asChild className="mt-6">
          <Link href="/coaches">Browse all coaches</Link>
        </Button>
      </div>
    )
  }

  const avatarUrl = coach.avatarUrl || coach.user.avatarUrl
  const displayName = coach.user.name

  const canBook =
    coach.hourlyRate !== undefined ||
    coach.halfDayRate !== undefined ||
    coach.fullDayRate !== undefined

  const isUnavailable = (date: Date) => unavailableKeys.has(startOfLocalDay(date).toDateString())

  // Reject a range that spans an unavailable day on selection (a click) rather
  // than via `excludeDisabled`, which recomputes during hover preview.
  const handleRangeSelect = (selected: DateRange | undefined) => {
    if (selected?.from && selected.to) {
      for (let d = new Date(selected.from); d <= selected.to; d.setDate(d.getDate() + 1)) {
        if (isUnavailable(d)) {
          toast.error("That range includes an unavailable day — pick dates that are all open.")
          setRange({ from: selected.from })
          return
        }
      }
    }
    setRange(selected)
  }

  let rangeLabel: string | null = null
  if (range?.from) {
    const isMultiDay = range.to && range.to.getTime() !== range.from.getTime()
    rangeLabel = isMultiDay
      ? `${fmtShort(range.from)} – ${fmtShort(range.to as Date)}`
      : fmtLong(range.from)
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link className="mb-4 inline-block" href="/coaches">
        <Button size="sm" variant="ghost">
          <ArrowLeft className="mr-2 size-4" />
          All Coaches
        </Button>
      </Link>

      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar className="size-28 border-2 border-primary/20">
              {avatarUrl ? (
                <AvatarImage alt={displayName} src={avatarUrl} />
              ) : (
                <AvatarFallback className="bg-primary text-white">
                  <User className="size-12" />
                </AvatarFallback>
              )}
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="font-bold text-3xl tracking-tight">{displayName}</h1>
                  {coach.headline && (
                    <p className="mt-1 text-lg text-muted-foreground">{coach.headline}</p>
                  )}
                </div>
                {coach.isOwner ? (
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/coach/onboarding">
                        <Edit className="mr-2 size-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button onClick={handleToggleVisibility} size="sm" variant="outline">
                      {coach.isActive ? (
                        <>
                          <EyeOff className="mr-2 size-4" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 size-4" />
                          Show
                        </>
                      )}
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  {coach.location}
                </span>
                {coach.yearsExperience !== undefined && (
                  <span className="flex items-center gap-1">
                    <Trophy className="size-4" />
                    {coach.yearsExperience}+ yrs experience
                  </span>
                )}
                {averageRating !== null && (
                  <span className="flex items-center gap-1">
                    <Star className="size-4 fill-yellow-400 text-yellow-400" />
                    {averageRating.toFixed(1)} ({reviews?.length} reviews)
                  </span>
                )}
                {!coach.isActive && <Badge variant="secondary">Profile hidden</Badge>}
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {coach.specialties.map((s) => (
                  <Badge key={s} variant="secondary">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {coach.bio}
              </p>
            </CardContent>
          </Card>

          {/* Certifications & Tracks */}
          {((coach.certifications && coach.certifications.length > 0) ||
            (coach.tracksCoachedAt && coach.tracksCoachedAt.length > 0)) && (
            <Card>
              <CardHeader>
                <CardTitle>Credentials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {coach.certifications && coach.certifications.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
                      <Award className="size-4" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {coach.certifications.map((c) => (
                        <Badge key={c} variant="outline">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {coach.tracksCoachedAt && coach.tracksCoachedAt.length > 0 && (
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 font-semibold text-sm">
                      <MapPin className="size-4" />
                      Tracks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {coach.tracksCoachedAt.map((t) => (
                        <Badge key={t} variant="outline">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5" />
                Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviews === undefined ? (
                <Skeleton className="h-24 w-full" />
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground text-sm">No reviews yet.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((r) => (
                    <div className="border-b pb-4 last:border-b-0 last:pb-0" key={r._id}>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {r.reviewer?.name || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              className={
                                i < r.rating
                                  ? "size-3 fill-yellow-400 text-yellow-400"
                                  : "size-3 text-muted-foreground"
                              }
                              key={i}
                            />
                          ))}
                        </span>
                      </div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="mt-1 text-muted-foreground text-sm">{r.review}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Rates + booking CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Rates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {coach.hourlyRate !== undefined && (
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground text-sm">Hourly</span>
                  <span className="font-bold text-lg">{formatCents(coach.hourlyRate)}/hr</span>
                </div>
              )}
              {coach.halfDayRate !== undefined && (
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground text-sm">Half-day</span>
                  <span className="font-bold text-lg">{formatCents(coach.halfDayRate)}</span>
                </div>
              )}
              {coach.fullDayRate !== undefined && (
                <div className="flex items-baseline justify-between">
                  <span className="text-muted-foreground text-sm">Full-day</span>
                  <span className="font-bold text-lg">{formatCents(coach.fullDayRate)}</span>
                </div>
              )}
              <Separator />
              {coach.isOwner ? (
                <p className="text-muted-foreground text-sm">
                  This is your profile. Bookings will appear in your{" "}
                  <Link className="underline" href="/coach/dashboard">
                    coach dashboard
                  </Link>
                  .
                </p>
              ) : (
                <div className="space-y-3">
                  {canBook ? (
                    <>
                      <div>
                        <p className="mb-2 font-medium text-sm">Pick your date(s)</p>
                        <div className="flex justify-center">
                          <Calendar
                            className="[--cell-size:--spacing(9)]"
                            disabled={isDisabledDay}
                            mode="range"
                            modifiers={modifiers}
                            modifiersClassNames={MODIFIER_CLASSES}
                            month={calendarMonth}
                            onMonthChange={setCalendarMonth}
                            onSelect={handleRangeSelect}
                            selected={range}
                          />
                        </div>
                      </div>

                      {rangeLabel && (
                        <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                          <span className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-muted-foreground" />
                            {rangeLabel}
                          </span>
                          <button
                            className="text-muted-foreground text-xs underline"
                            onClick={() => setRange(undefined)}
                            type="button"
                          >
                            Clear
                          </button>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        disabled={!(isSignedIn && coach.isActive && range?.from)}
                        onClick={() => setBookingOpen(true)}
                        size="lg"
                      >
                        <CalendarDays className="mr-2 size-4" />
                        Request session
                      </Button>
                      <Button
                        className="w-full"
                        disabled={!(isSignedIn && coach.isActive)}
                        onClick={() => setContactOpen(true)}
                        size="lg"
                        variant="outline"
                      >
                        <MessageSquare className="mr-2 size-4" />
                        Message coach
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      disabled={!(isSignedIn && coach.isActive)}
                      onClick={() => setContactOpen(true)}
                      size="lg"
                    >
                      <MessageSquare className="mr-2 size-4" />
                      Contact Coach
                    </Button>
                  )}
                  {!isSignedIn && (
                    <p className="text-center text-muted-foreground text-xs">
                      <Link className="underline" href="/sign-in">
                        Sign in
                      </Link>{" "}
                      to book or message this coach
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact / social */}
          {(coach.contactInfo || coach.socialLinks) && (
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {coach.contactInfo?.email && (
                  <a
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    href={`mailto:${coach.contactInfo.email}`}
                  >
                    <Mail className="size-4" />
                    {coach.contactInfo.email}
                  </a>
                )}
                {coach.contactInfo?.phone && (
                  <a
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    href={`tel:${coach.contactInfo.phone}`}
                  >
                    <Phone className="size-4" />
                    {coach.contactInfo.phone}
                  </a>
                )}
                {coach.socialLinks?.instagram && (
                  <a
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    href={socialUrl("https://instagram.com/", coach.socialLinks.instagram)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Instagram className="size-4" />
                    Instagram
                  </a>
                )}
                {coach.socialLinks?.twitter && (
                  <a
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    href={socialUrl("https://twitter.com/", coach.socialLinks.twitter)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Twitter className="size-4" />
                    Twitter
                  </a>
                )}
                {coach.socialLinks?.linkedin && (
                  <a
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    href={socialUrl("https://linkedin.com/in/", coach.socialLinks.linkedin)}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Linkedin className="size-4" />
                    LinkedIn
                  </a>
                )}
                {coach.socialLinks?.website && (
                  <a
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    href={
                      coach.socialLinks.website.startsWith("http")
                        ? coach.socialLinks.website
                        : `https://${coach.socialLinks.website}`
                    }
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Globe className="size-4" />
                    Website
                  </a>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {!coach.isOwner && (
        <CoachContactDialog
          coachName={displayName}
          coachProfileId={coachId}
          onOpenChange={setContactOpen}
          open={contactOpen}
        />
      )}

      {!coach.isOwner && range?.from && (
        <CoachBookingDialog
          coachName={displayName}
          coachProfileId={coachId}
          endDate={range.to ?? range.from}
          fullDayRate={coach.fullDayRate}
          halfDayRate={coach.halfDayRate}
          hourlyRate={coach.hourlyRate}
          onOpenChange={setBookingOpen}
          open={bookingOpen}
          startDate={range.from}
        />
      )}
    </div>
  )
}
