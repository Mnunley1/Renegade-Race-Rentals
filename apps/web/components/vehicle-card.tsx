"use client"

import { useUser } from "@clerk/nextjs"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Dialog, DialogContent } from "@workspace/ui/components/dialog"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation, useQuery } from "convex/react"
import type { LucideIcon } from "lucide-react"
import { Car, Cog, Gauge, Heart, LogIn, MapPin, Star, UserPlus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import type { ComponentProps } from "react"
import { useState } from "react"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"
import { r2Url } from "@/lib/r2-url"

interface VehicleCardProps extends ComponentProps<"div"> {
  id: string
  image: string
  imageKey?: string
  name: string
  year: number
  make: string
  model: string
  pricePerDay: number
  location?: string
  track?: string
  rating?: number
  reviews?: number
  horsepower?: number
  transmission?: string
  drivetrain?: string
  datesSelected?: boolean
  bookingCount?: number
  hostStripeReady?: boolean
}

export function VehicleCard({
  id,
  image,
  imageKey,
  name,
  year,
  make,
  model,
  pricePerDay,
  location,
  track,
  rating,
  reviews,
  horsepower,
  transmission,
  drivetrain,
  datesSelected,
  bookingCount,
  hostStripeReady,
  className,
  ...props
}: VehicleCardProps) {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showLoginDialog, setShowLoginDialog] = useState(false)

  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  const vehicleUrl =
    startDate && endDate
      ? `/vehicles/${id}?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      : `/vehicles/${id}`

  const isFavorite = useQuery(
    api.favorites.isVehicleFavorited,
    isSignedIn && id ? { vehicleId: id as Id<"vehicles"> } : "skip"
  )

  const toggleFavorite = useMutation(api.favorites.toggleFavorite)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      setShowLoginDialog(true)
      return
    }

    if (isFavorite === undefined) {
      return
    }

    if (!user?.id) {
      setShowLoginDialog(true)
      return
    }

    try {
      await toggleFavorite({ vehicleId: id as Id<"vehicles"> })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes("Not authenticated") || errorMessage.includes("authentication")) {
        setShowLoginDialog(true)
      } else {
        handleErrorWithContext(error, {
          action: "update favorites",
          customMessages: {
            generic: "Failed to update favorites. Please try again.",
          },
        })
      }
    }
  }

  const handleLogin = () => {
    setShowLoginDialog(false)
    router.push(`/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`)
  }

  const weekendPrice = Math.round(pricePerDay * 2.5)

  // Performance spec strip (Turo-style icon + value units)
  const specs: { icon: LucideIcon; label: string }[] = []
  if (horsepower && horsepower > 0) specs.push({ icon: Gauge, label: `${horsepower} HP` })
  if (transmission) specs.push({ icon: Cog, label: transmission })
  if (drivetrain) specs.push({ icon: Car, label: drivetrain })

  return (
    <>
      <Link className="block h-full" href={vehicleUrl}>
        <Card
          className={cn(
            "group relative flex h-full cursor-pointer flex-col overflow-hidden border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]",
            className
          )}
          {...props}
        >
          {/* Racing-stripe accent — sweeps in on hover */}
          <div className="absolute top-0 right-0 left-0 z-20 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary to-primary/40 transition-transform duration-300 group-hover:scale-x-100" />

          {/* Image Section */}
          <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-muted">
            {imageKey || image ? (
              <Image
                alt={name}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                quality={80}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                src={imageKey ? r2Url(imageKey) : image}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <Car className="size-16 text-muted-foreground/50" />
              </div>
            )}

            {/* Legibility gradients — top for badges, bottom for price */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
              {track && (
                <Badge className="border border-white/15 bg-black/55 text-white text-xs backdrop-blur-md hover:bg-black/55">
                  {track}
                </Badge>
              )}
              {datesSelected && (
                <Badge className="border border-white/15 bg-green-600/90 text-white text-xs backdrop-blur-md hover:bg-green-600/90">
                  Available
                </Badge>
              )}
              {bookingCount !== undefined && bookingCount > 0 && (
                <Badge className="border border-white/15 bg-amber-600/90 text-white text-xs backdrop-blur-md hover:bg-amber-600/90">
                  Booked {bookingCount}x
                </Badge>
              )}
              {hostStripeReady === false && (
                <Badge className="border border-white/15 bg-blue-600/90 text-white text-xs backdrop-blur-md hover:bg-blue-600/90">
                  Coming Soon
                </Badge>
              )}
            </div>

            {/* Favorite Button */}
            <Button
              className="absolute top-3 right-3 z-20 size-9 rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition-colors hover:bg-black/50"
              onClick={handleFavoriteClick}
              size="icon"
              variant="ghost"
            >
              <Heart
                className={cn(
                  "size-5 transition-all",
                  isFavorite === true
                    ? "scale-110 fill-red-500 text-red-500"
                    : "text-white group-hover:text-red-400"
                )}
              />
            </Button>

            {/* Price Tag */}
            <div className="absolute right-3 bottom-3 left-3 z-20 flex items-end justify-between">
              <div className="flex items-baseline gap-1.5 rounded-lg border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-md">
                <span className="font-bold text-lg text-white tracking-tight">${pricePerDay}</span>
                <span className="text-white/70 text-xs">/day</span>
                <span className="text-white/40 text-xs">· ${weekendPrice} wknd</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <CardContent className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 font-semibold text-base leading-snug tracking-tight transition-colors group-hover:text-primary sm:text-lg">
                {year} {make} {model}
              </h3>

              {rating !== undefined && rating > 0 && (
                <div className="flex shrink-0 items-center gap-1 pt-0.5">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-sm">{rating.toFixed(1)}</span>
                  {reviews !== undefined && reviews > 0 && (
                    <span className="text-muted-foreground text-xs">({reviews})</span>
                  )}
                </div>
              )}
            </div>

            {location && (
              <div className="mt-2 flex min-w-0 items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate text-sm">{location}</span>
              </div>
            )}

            {specs.length > 0 && (
              <div className="mt-auto flex items-center gap-3 border-t pt-3.5">
                {specs.map((spec, i) => (
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      i > 0 && "border-border border-l pl-3"
                    )}
                    key={spec.label}
                  >
                    <spec.icon className="size-4 shrink-0 text-primary/70" />
                    <span className="font-medium text-foreground text-xs">{spec.label}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>

      {/* Login Dialog - Outside Link to fix nesting bug */}
      <Dialog onOpenChange={setShowLoginDialog} open={showLoginDialog}>
        <DialogContent className="border border-border bg-background p-0 sm:max-w-md">
          <Card className="border-0 shadow-none">
            <CardContent className="p-8">
              <div className="mb-6 text-center">
                <div className="mb-4 flex items-center justify-center gap-2">
                  <Car className="size-8 text-[#EF1C25]" />
                  <span className="font-bold text-2xl text-foreground">Renegade Rentals</span>
                </div>
                <h2 className="mb-2 font-bold text-2xl text-foreground">Sign In Required</h2>
                <p className="text-muted-foreground">
                  Please sign in to save your favorite vehicles and access them anytime.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-[#EF1C25] text-white hover:bg-[#EF1C25]/90"
                  onClick={handleLogin}
                  size="lg"
                >
                  <LogIn className="mr-2 size-4" />
                  Sign In
                </Button>

                <Button
                  className="w-full border-border hover:bg-muted"
                  onClick={() => {
                    setShowLoginDialog(false)
                    router.push("/sign-up")
                  }}
                  size="lg"
                  variant="outline"
                >
                  <UserPlus className="mr-2 size-4" />
                  Create Account
                </Button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Join thousands of racing enthusiasts
                </p>
              </div>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  )
}
