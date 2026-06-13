"use client"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"
import { useQuery } from "convex/react"
import { MapPin, Plus, Search, Settings, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { CoachCard } from "@/components/coach-card"
import { useDebounce } from "@/hooks/useDebounce"
import { api } from "@/lib/convex"

const ITEMS_PER_PAGE = 12

const RACING_TYPES = [
  { value: "all", label: "All" },
  { value: "real-world", label: "Real-World" },
  { value: "sim-racing", label: "Sim Racing" },
  { value: "both", label: "Both" },
] as const

export default function CoachesPage() {
  const [racingTypeFilter, setRacingTypeFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [locationFilter, setLocationFilter] = useState<string>("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const coachesData = useQuery(api.coachProfiles.list, {
    racingType:
      racingTypeFilter !== "all"
        ? (racingTypeFilter as "real-world" | "sim-racing" | "both")
        : undefined,
    location: locationFilter || undefined,
    specialty: specialtyFilter !== "all" ? specialtyFilter : undefined,
  })

  const userCoachProfile = useQuery(api.coachProfiles.getByUser)

  const allCoaches = useMemo(() => {
    if (!coachesData) return []
    return coachesData.map((coach: any) => ({
      id: coach._id as string,
      name: coach.user?.name || "Unknown Coach",
      avatarUrl: coach.avatarUrl || coach.user?.avatarUrl,
      location: coach.location,
      headline: coach.headline,
      bio: coach.bio,
      specialties: coach.specialties as string[],
      yearsExperience: coach.yearsExperience,
      hourlyRate: coach.hourlyRate,
      halfDayRate: coach.halfDayRate,
      fullDayRate: coach.fullDayRate,
      rating: coach.rating as number | undefined,
      reviewCount: coach.reviewCount as number | undefined,
      verificationStatus: coach.verificationStatus as
        | "pending"
        | "verified"
        | "rejected"
        | undefined,
      racingType: coach.racingType as "real-world" | "sim-racing" | "both" | undefined,
    }))
  }, [coachesData])

  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>()
    for (const coach of allCoaches) {
      locations.add(coach.location)
    }
    return Array.from(locations).sort()
  }, [allCoaches])

  const uniqueSpecialties = useMemo(() => {
    const specialties = new Set<string>()
    for (const coach of allCoaches) {
      for (const s of coach.specialties) specialties.add(s)
    }
    return Array.from(specialties).sort()
  }, [allCoaches])

  const coaches = useMemo(() => {
    let filtered = allCoaches
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.location.toLowerCase().includes(q) ||
          c.headline?.toLowerCase().includes(q) ||
          c.bio.toLowerCase().includes(q) ||
          c.specialties.some((s) => s.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [allCoaches, debouncedSearchQuery])

  const paginatedCoaches = coaches.slice(0, page * ITEMS_PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery, racingTypeFilter, locationFilter, specialtyFilter])

  const hasActiveFilters =
    racingTypeFilter !== "all" ||
    debouncedSearchQuery.trim() !== "" ||
    locationFilter !== "" ||
    specialtyFilter !== "all"

  const resetFilters = () => {
    setSearchQuery("")
    setLocationFilter("")
    setRacingTypeFilter("all")
    setSpecialtyFilter("all")
    setPage(1)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <span className="font-medium font-mono text-primary text-xs uppercase tracking-[0.25em]">
              Driver Coaching
            </span>
          </div>
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">Find Your Coach</h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Train with verified driving coaches to elevate your next track day — from first laps to
            podium pace.
          </p>
        </div>
        {userCoachProfile ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/coaches/${userCoachProfile._id}`}>
              <Settings className="mr-2 size-4" />
              Manage Profile
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm">
            <Link href="/coach/onboarding">
              <Plus className="mr-2 size-4" />
              Become a Coach
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pr-4 pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coaches by name, location, specialty..."
            value={searchQuery}
          />
          {searchQuery && (
            <Button
              className="absolute top-1/2 right-2 -translate-y-1/2"
              onClick={() => setSearchQuery("")}
              size="sm"
              variant="ghost"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Racing type quick chips */}
          <div className="flex flex-wrap gap-2">
            {RACING_TYPES.map((type) => {
              const active = racingTypeFilter === type.value
              return (
                <button
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-medium text-sm transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                  key={type.value}
                  onClick={() => setRacingTypeFilter(type.value)}
                  type="button"
                >
                  {type.label}
                </button>
              )
            })}
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            {hasActiveFilters && (
              <Button onClick={resetFilters} size="sm" variant="ghost">
                <X className="mr-1 size-3" />
                Clear All
              </Button>
            )}

            {uniqueLocations.length > 0 && (
              <Select
                onValueChange={(v) => setLocationFilter(v === "all" ? "" : v)}
                value={locationFilter || "all"}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {uniqueSpecialties.length > 0 && (
              <Select onValueChange={setSpecialtyFilter} value={specialtyFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specialties</SelectItem>
                  {uniqueSpecialties.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {(locationFilter || specialtyFilter !== "all" || debouncedSearchQuery) && (
          <div className="flex flex-wrap gap-2">
            {locationFilter && (
              <Badge className="gap-1" variant="secondary">
                <MapPin className="size-3" />
                {locationFilter}
                <button
                  aria-label="Remove location filter"
                  className="ml-1 rounded-full hover:bg-muted"
                  onClick={() => setLocationFilter("")}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {specialtyFilter !== "all" && (
              <Badge className="gap-1" variant="secondary">
                {specialtyFilter}
                <button
                  aria-label="Remove specialty filter"
                  className="ml-1 rounded-full hover:bg-muted"
                  onClick={() => setSpecialtyFilter("all")}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {debouncedSearchQuery && (
              <Badge className="gap-1" variant="secondary">
                <Search className="size-3" />"{debouncedSearchQuery}"
                <button
                  aria-label="Remove search filter"
                  className="ml-1 rounded-full hover:bg-muted"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-sm">
            {(() => {
              if (coachesData === undefined) return "Loading coaches..."
              const label = coaches.length === 1 ? "coach" : "coaches"
              return `Showing ${paginatedCoaches.length} of ${coaches.length} ${label}`
            })()}
          </p>
        </div>

        {(() => {
          if (coachesData === undefined) {
            return (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start gap-4">
                        <Skeleton className="size-20 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                      <div className="flex items-center justify-between border-t pt-4">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          }
          if (coaches.length === 0) {
            return (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="mb-4 font-semibold text-lg">No coaches available</p>
                  <p className="mb-6 text-muted-foreground text-sm">
                    Be the first to advertise your coaching services on Renegade.
                  </p>
                  <Button asChild>
                    <Link href="/coach/onboarding">
                      <Plus className="mr-2 size-4" />
                      Become a Coach
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          }
          return (
            <>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {paginatedCoaches.map((coach) => (
                  <CoachCard key={coach.id} {...coach} />
                ))}
              </div>
              {paginatedCoaches.length < coaches.length && (
                <div className="flex justify-center pt-4">
                  <Button onClick={() => setPage((p) => p + 1)} variant="outline">
                    Load More ({coaches.length - paginatedCoaches.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}
