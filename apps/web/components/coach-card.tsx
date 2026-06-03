import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"
import { Clock, MapPin, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ComponentProps } from "react"

interface CoachCardProps extends ComponentProps<"div"> {
  id: string
  name: string
  avatarUrl?: string
  location: string
  headline?: string
  bio: string
  specialties: string[]
  yearsExperience?: number
  hourlyRate?: number
  halfDayRate?: number
  fullDayRate?: number
}

const MAX_BIO_PREVIEW_LENGTH = 90

function formatCents(cents?: number) {
  if (cents === undefined) return null
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function startingRateLabel(
  props: Pick<CoachCardProps, "hourlyRate" | "halfDayRate" | "fullDayRate">
) {
  if (props.hourlyRate !== undefined) return `${formatCents(props.hourlyRate)}/hr`
  if (props.halfDayRate !== undefined) return `${formatCents(props.halfDayRate)} half-day`
  if (props.fullDayRate !== undefined) return `${formatCents(props.fullDayRate)} full-day`
  return null
}

export function CoachCard({
  id,
  name,
  avatarUrl,
  location,
  headline,
  bio,
  specialties,
  yearsExperience,
  hourlyRate,
  halfDayRate,
  fullDayRate,
  className,
  ...props
}: CoachCardProps) {
  const displayText =
    headline ||
    (bio
      ? `${bio.substring(0, MAX_BIO_PREVIEW_LENGTH)}${bio.length > MAX_BIO_PREVIEW_LENGTH ? "..." : ""}`
      : "")

  const rate = startingRateLabel({ hourlyRate, halfDayRate, fullDayRate })

  return (
    <Link className="flex h-full" href={`/coaches/${id}`}>
      <Card
        className={cn(
          "group relative flex h-full w-full cursor-pointer flex-col overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-xl",
          className
        )}
        {...props}
      >
        <CardContent className="flex flex-1 flex-col p-4">
          <div className="flex flex-1 flex-col space-y-3">
            <div className="flex items-start gap-4">
              <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20">
                {avatarUrl && avatarUrl.trim() !== "" ? (
                  <Image alt={name} className="object-cover" fill src={avatarUrl} />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary">
                    <User className="size-12 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-xl transition-colors group-hover:text-primary">
                  {name}
                </h3>
                <div className="mt-1.5 flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="size-4" />
                  <span className="truncate">{location}</span>
                </div>
                {rate && (
                  <div className="mt-1.5 flex items-center gap-2 font-semibold text-primary text-sm">
                    <Clock className="size-4" />
                    {rate}
                  </div>
                )}
              </div>
            </div>

            {displayText && (
              <p
                className={
                  headline
                    ? "font-semibold text-base text-foreground"
                    : "line-clamp-2 text-muted-foreground text-sm leading-relaxed"
                }
              >
                {displayText}
              </p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2">
              {yearsExperience !== undefined && (
                <Badge variant="secondary">{yearsExperience}+ yrs experience</Badge>
              )}
              {specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
              {specialties.length > 3 && <Badge variant="outline">+{specialties.length - 3}</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
