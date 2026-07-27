"use client"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"
import { useMutation } from "convex/react"
import { format } from "date-fns"
import { CalendarDays, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { toast } from "sonner"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

type SessionType = "hourly" | "half_day" | "full_day"

type Props = {
  coachProfileId: Id<"coachProfiles">
  coachName: string
  hourlyRate?: number
  halfDayRate?: number
  fullDayRate?: number
  startDate: Date
  endDate: Date
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function toDateKey(d: Date) {
  return format(d, "yyyy-MM-dd")
}

export function CoachBookingDialog({
  coachProfileId,
  coachName,
  hourlyRate,
  halfDayRate,
  fullDayRate,
  startDate,
  endDate,
  open,
  onOpenChange,
}: Props) {
  const router = useRouter()
  const create = useMutation(api.coachingBookings.create)

  const totalDays = useMemo(() => {
    const ms = endDate.getTime() - startDate.getTime()
    return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1)
  }, [startDate, endDate])
  const isMultiDay = totalDays > 1

  const defaultSessionType = useMemo<SessionType>(() => {
    if (isMultiDay) {
      if (fullDayRate !== undefined) return "full_day"
      if (halfDayRate !== undefined) return "half_day"
      return "hourly"
    }
    if (hourlyRate !== undefined) return "hourly"
    if (halfDayRate !== undefined) return "half_day"
    return "full_day"
  }, [hourlyRate, halfDayRate, fullDayRate, isMultiDay])

  const [sessionType, setSessionType] = useState<SessionType>(defaultSessionType)
  const [startTime, setStartTime] = useState("09:00")
  const [hours, setHours] = useState("2")
  const [eventName, setEventName] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const sessionOptions = (
    [
      { value: "hourly", label: "Hourly", rate: hourlyRate },
      { value: "half_day", label: "Half-day", rate: halfDayRate },
      { value: "full_day", label: "Full-day", rate: fullDayRate },
    ] satisfies { value: SessionType; label: string; rate?: number }[]
  ).filter((opt) => opt.rate !== undefined)

  const currentRate =
    sessionType === "hourly" ? hourlyRate : sessionType === "half_day" ? halfDayRate : fullDayRate

  const estimatedTotal = useMemo(() => {
    if (currentRate === undefined) return 0
    if (sessionType === "hourly") {
      const h = Number.parseFloat(hours)
      if (Number.isNaN(h) || h <= 0) return 0
      return Math.round(currentRate * h)
    }
    return currentRate * totalDays
  }, [currentRate, sessionType, hours, totalDays])

  const handleSubmit = async () => {
    if (sessionType === "hourly") {
      if (isMultiDay) {
        toast.error(
          "Hourly sessions must be a single day — pick a date range only for half/full-day bookings"
        )
        return
      }
      const h = Number.parseFloat(hours)
      if (Number.isNaN(h) || h <= 0) {
        toast.error("Enter how many hours you want")
        return
      }
      if (!startTime) {
        toast.error("Enter a start time")
        return
      }
    }

    setSubmitting(true)
    try {
      const id = await create({
        coachProfileId,
        sessionType,
        startDate: toDateKey(startDate),
        endDate: toDateKey(endDate),
        startTime: sessionType === "hourly" ? startTime : undefined,
        hours: sessionType === "hourly" ? Number.parseFloat(hours) : undefined,
        eventName: eventName.trim() || undefined,
        renterMessage: message.trim() || undefined,
      })
      toast.success("Request sent — the coach will respond shortly")
      onOpenChange(false)
      router.push(`/trips?coachingBookingId=${id}`)
    } catch (err) {
      handleErrorWithContext(err, { action: "request coaching session", entity: "booking" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Request a coaching session</DialogTitle>
          <DialogDescription>
            {coachName} will review and approve. You'll be prompted to pay once approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selected date summary */}
          <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <CalendarDays className="size-5 text-muted-foreground" />
            <div>
              <div className="font-semibold text-sm">
                {isMultiDay
                  ? `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")} (${totalDays} days)`
                  : format(startDate, "EEEE, MMMM d, yyyy")}
              </div>
              <div className="text-muted-foreground text-xs">
                Picked from the availability calendar
              </div>
            </div>
          </div>

          {/* Session type */}
          <div className="space-y-2">
            <Label>Session type</Label>
            <div className="grid grid-cols-3 gap-2">
              {sessionOptions.map((opt) => {
                const disabled = opt.value === "hourly" && isMultiDay
                return (
                  <button
                    className={cn(
                      "rounded-md border p-3 text-left transition-colors hover:border-primary",
                      sessionType === opt.value && "border-primary bg-primary/5",
                      disabled && "cursor-not-allowed opacity-40 hover:border-input"
                    )}
                    disabled={disabled}
                    key={opt.value}
                    onClick={() => setSessionType(opt.value)}
                    type="button"
                  >
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-muted-foreground text-xs">
                      {formatCents(opt.rate as number)}
                      {opt.value === "hourly" ? "/hr" : isMultiDay ? "/day" : ""}
                    </div>
                  </button>
                )
              })}
            </div>
            {isMultiDay && (
              <p className="text-muted-foreground text-xs">
                Multi-day bookings are charged per day at the half- or full-day rate.
              </p>
            )}
          </div>

          {/* Hourly-only fields */}
          {sessionType === "hourly" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  inputMode="decimal"
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="2"
                  value={hours}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start time</Label>
                <Input
                  id="startTime"
                  onChange={(e) => setStartTime(e.target.value)}
                  type="time"
                  value={startTime}
                />
              </div>
            </div>
          )}

          {/* Optional event */}
          <div className="space-y-2">
            <Label htmlFor="event">Event (optional)</Label>
            <Input
              id="event"
              maxLength={200}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. SCCA weekend at COTA"
              value={eventName}
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message to coach (optional)</Label>
            <Textarea
              id="message"
              maxLength={1000}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What car you're driving, your experience level, any goals…"
              rows={3}
              value={message}
            />
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
            <span className="text-sm">Estimated total</span>
            <span className="font-bold text-lg">{formatCents(estimatedTotal)}</span>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Cancel
          </Button>
          <Button disabled={submitting} onClick={handleSubmit} type="button">
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Send request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
