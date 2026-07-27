"use client"

import { useUser } from "@clerk/nextjs"
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
import { FileText, Search, User, Users, X } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import { DriverCard } from "@/components/driver-card"
import { RecommendationCard } from "@/components/recommendation-card"
import { TeamCard } from "@/components/team-card"
import { useDebounce } from "@/hooks/useDebounce"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"

const ITEMS_PER_PAGE = 9

type View = "teams" | "drivers"

const RACING_TYPES = [
  { value: "all", label: "All racing" },
  { value: "real-world", label: "Real-World" },
  { value: "sim-racing", label: "Sim Racing" },
  { value: "both", label: "Both" },
]

const EXPERIENCE_LEVELS = [
  { value: "all", label: "Any experience" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "professional", label: "Professional" },
]

const SEAT_OPTIONS = [
  { value: "all", label: "Any seats" },
  { value: "1", label: "1+ open seat" },
  { value: "2", label: "2+ open seats" },
  { value: "3", label: "3+ open seats" },
]

export default function MotorsportsPage() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Role detection
  const driverProfile = useQuery(api.driverProfiles.getByUser)
  const teamMembership = useQuery(api.teamMembers.getByUser, user ? {} : "skip")
  const isDriver = Array.isArray(driverProfile) ? driverProfile.length > 0 : Boolean(driverProfile)
  const isTeam = Array.isArray(teamMembership) ? teamMembership.length > 0 : Boolean(teamMembership)
  const myTeamId = Array.isArray(teamMembership)
    ? (teamMembership[0]?.teamId as Id<"teams"> | undefined)
    : undefined

  // View (segmented toggle) — defaults by role, overridable via ?view= or click
  const urlView = searchParams.get("view") as View | null
  const [view, setView] = useState<View>(urlView ?? "teams")
  const didInitView = useRef(urlView !== null)
  useEffect(() => {
    if (didInitView.current) return
    if (driverProfile === undefined || teamMembership === undefined) return
    didInitView.current = true
    if (isTeam && !isDriver) setView("drivers")
    else setView("teams")
  }, [driverProfile, teamMembership, isDriver, isTeam])

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [racingTypeFilter, setRacingTypeFilter] = useState("all")
  const [experienceFilter, setExperienceFilter] = useState("all")
  const [minSeatsFilter, setMinSeatsFilter] = useState("all")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(searchQuery, 300)

  const racingType =
    racingTypeFilter !== "all"
      ? (racingTypeFilter as "real-world" | "sim-racing" | "both")
      : undefined
  const location = locationFilter !== "all" ? locationFilter : undefined

  const teamsData = useQuery(api.teams.list, { racingType, location })
  const driversData = useQuery(api.driverProfiles.list, {
    racingType,
    location,
    experience:
      experienceFilter !== "all"
        ? (experienceFilter as "beginner" | "intermediate" | "advanced" | "professional")
        : undefined,
  })

  // Personalized matches (role-based)
  const recommendedTeams = useQuery(
    api.motorsportsMatching.getRecommendedTeams,
    isDriver ? {} : "skip"
  )
  const recommendedDrivers = useQuery(
    api.motorsportsMatching.getRecommendedDrivers,
    myTeamId ? { teamId: myTeamId } : "skip"
  )

  // Reset pagination on filter/view change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, racingTypeFilter, locationFilter, experienceFilter, minSeatsFilter, view])

  const teams = useMemo(() => {
    if (!teamsData) return []
    let filtered = teamsData as any[]
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(q) ||
          t.location?.toLowerCase().includes(q) ||
          t.specialties?.some((s: string) => s.toLowerCase().includes(q))
      )
    }
    if (minSeatsFilter !== "all") {
      const min = Number.parseInt(minSeatsFilter, 10)
      filtered = filtered.filter((t) => (t.availableSeats ?? 0) >= min)
    }
    return filtered
  }, [teamsData, debouncedSearch, minSeatsFilter])

  const drivers = useMemo(() => {
    if (!driversData) return []
    let filtered = driversData as any[]
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      filtered = filtered.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(q) ||
          d.location?.toLowerCase().includes(q) ||
          d.headline?.toLowerCase().includes(q) ||
          d.preferredCategories?.some((c: string) => c.toLowerCase().includes(q))
      )
    }
    return filtered
  }, [driversData, debouncedSearch])

  const activeList = view === "teams" ? teams : drivers
  const isLoading = view === "teams" ? teamsData === undefined : driversData === undefined
  const paginated = activeList.slice(0, page * ITEMS_PER_PAGE)

  const locationOptions = useMemo(() => {
    const set = new Set<string>()
    for (const item of view === "teams" ? teams : drivers) {
      if (item.location) set.add(item.location)
    }
    return Array.from(set).sort()
  }, [teams, drivers, view])

  const rawRecommendations = view === "teams" ? recommendedTeams : recommendedDrivers
  // Only surface matches that have a usable display name (driver recs are not name-enriched yet)
  const recommendations = ((rawRecommendations as any[]) || []).filter(
    (r) => r.name || r.user?.name
  )
  const hasActiveFilters =
    debouncedSearch.trim() !== "" ||
    locationFilter !== "all" ||
    racingTypeFilter !== "all" ||
    (view === "drivers" && experienceFilter !== "all") ||
    (view === "teams" && minSeatsFilter !== "all")

  const clearFilters = () => {
    setSearchQuery("")
    setLocationFilter("all")
    setRacingTypeFilter("all")
    setExperienceFilter("all")
    setMinSeatsFilter("all")
  }

  const switchView = (next: View) => {
    didInitView.current = true
    setView(next)
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", next)
    router.replace(`/motorsports?${params.toString()}`, { scroll: false })
  }

  const getRoleSubtitle = () => {
    if (isDriver) return "Find a team with an open seat and accelerate your racing career."
    if (isTeam) return "Discover drivers ready to join your team."
    return "Where drivers and racing teams find each other — real-world and sim."
  }
  const roleSubtitle = getRoleSubtitle()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-primary" />
            <span className="font-medium font-mono text-primary text-xs uppercase tracking-[0.25em]">
              Motorsports Network
            </span>
          </div>
          <h1 className="font-bold text-4xl tracking-tight md:text-5xl">The Grid</h1>
          <p className="max-w-xl text-lg text-muted-foreground">{roleSubtitle}</p>
        </div>
        {user && (
          <Button asChild size="sm" variant="outline">
            <Link href="/motorsports/applications">
              <FileText className="mr-2 size-4" />
              My Applications
            </Link>
          </Button>
        )}
      </div>

      {/* Value-prop CTA for users with no profile */}
      {!(isDriver || isTeam) && (
        <Card className="mb-8 border-border bg-muted/30">
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div>
              <h2 className="font-semibold text-lg">Get on the grid</h2>
              <p className="text-muted-foreground text-sm">
                Create a profile to appear in search and unlock personalized matches.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Button asChild>
                <Link href="/motorsports/profile/driver">
                  <User className="mr-2 size-4" />
                  Join as Driver
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/motorsports/profile/team">
                  <Users className="mr-2 size-4" />
                  Join as Team
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized matches */}
      {recommendations && recommendations.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 font-semibold text-xl tracking-tight">Top matches for you</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.slice(0, 3).map((rec: any) => (
              <RecommendationCard
                availableSeats={rec.availableSeats}
                experience={rec.experience}
                id={rec._id}
                key={rec._id}
                location={rec.location}
                matchScore={rec.matchScore}
                name={rec.name || rec.user?.name}
                specialties={rec.specialties || rec.preferredCategories}
                type={view === "teams" ? "team" : "driver"}
              />
            ))}
          </div>
        </section>
      )}

      {/* Segmented toggle */}
      <div className="mb-6 inline-flex rounded-full border bg-muted/50 p-1">
        <button
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2 font-medium text-sm transition-colors",
            view === "teams"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => switchView("teams")}
          type="button"
        >
          <Users className="size-4" />
          Teams
          {teamsData && <span className="text-muted-foreground text-xs">({teams.length})</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-2 rounded-full px-5 py-2 font-medium text-sm transition-colors",
            view === "drivers"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => switchView("drivers")}
          type="button"
        >
          <User className="size-4" />
          Drivers
          {driversData && <span className="text-muted-foreground text-xs">({drivers.length})</span>}
        </button>
      </div>

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pr-9 pl-10"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={view === "teams" ? "Search teams…" : "Search drivers…"}
            value={searchQuery}
          />
          {searchQuery && (
            <button
              aria-label="Clear search"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
              type="button"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <Select onValueChange={setRacingTypeFilter} value={racingTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RACING_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view === "drivers" ? (
            <Select onValueChange={setExperienceFilter} value={experienceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select onValueChange={setMinSeatsFilter} value={minSeatsFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEAT_OPTIONS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {locationOptions.length > 0 && (
            <Select onValueChange={setLocationFilter} value={locationFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locationOptions.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {hasActiveFilters && (
            <Button onClick={clearFilters} size="sm" variant="ghost">
              <X className="mr-1 size-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start gap-4">
                  <Skeleton className="size-24 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : activeList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="mb-2 font-semibold text-lg">
              No {view} found{hasActiveFilters ? " for these filters" : " yet"}
            </p>
            <p className="mb-4 max-w-md text-muted-foreground text-sm">
              {hasActiveFilters
                ? "Try adjusting or clearing your filters to see more."
                : `Be the first ${view === "teams" ? "team" : "driver"} to join the network.`}
            </p>
            {hasActiveFilters ? (
              <Button onClick={clearFilters} variant="outline">
                Clear filters
              </Button>
            ) : (
              <Button asChild>
                <Link href={`/motorsports/profile/${view === "teams" ? "team" : "driver"}`}>
                  Create a profile
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {view === "teams"
              ? paginated.map((team: any) => (
                  <TeamCard
                    availableSeats={team.availableSeats}
                    id={team._id}
                    key={team._id}
                    location={team.location}
                    logoR2Key={team.logoR2Key}
                    logoUrl={team.logoUrl}
                    name={team.name}
                    racingType={team.racingType}
                    requirements={team.requirements}
                    simRacingPlatforms={team.simRacingPlatforms}
                    specialties={team.specialties}
                  />
                ))
              : paginated.map((driver: any) => (
                  <DriverCard
                    avatarUrl={driver.avatarUrl || driver.user?.avatarUrl}
                    bio={driver.bio}
                    experience={driver.experience}
                    headline={driver.headline}
                    id={driver._id}
                    key={driver._id}
                    licenses={driver.licenses}
                    location={driver.location}
                    name={driver.user?.name || "Unknown Driver"}
                    preferredCategories={driver.preferredCategories}
                    racingType={driver.racingType}
                    simRacingPlatforms={driver.simRacingPlatforms}
                    simRacingRating={driver.simRacingRating}
                  />
                ))}
          </div>
          {paginated.length < activeList.length && (
            <div className="flex justify-center pt-8">
              <Button onClick={() => setPage((p) => p + 1)} variant="outline">
                Load more ({activeList.length - paginated.length} remaining)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
