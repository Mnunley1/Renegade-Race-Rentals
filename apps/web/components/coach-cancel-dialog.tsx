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
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { useMutation } from "convex/react"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import type { Id } from "@/lib/convex"
import { api } from "@/lib/convex"
import { handleErrorWithContext } from "@/lib/error-handler"

type Role = "renter" | "coach"

type Props = {
  bookingId: Id<"coachingBookings">
  actorRole: Role
  status: string
  paymentStatus?: string
  startDate: string
  startTime?: string
  totalAmount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MIN_NOTICE_HOURS = 24
const HH_MM_RE = /^\d{2}:\d{2}$/

/**
 * Mirrors the backend cancellation policy (`isCoachingCancellationRefundable`)
 * so the renter sees the outcome before confirming. Dates are treated as UTC to
 * match how the server evaluates the window.
 */
function refundOutcome(params: {
  role: Role
  isPaid: boolean
  startDate: string
  startTime?: string
}): "full" | "none" | "not_paid" {
  if (!params.isPaid) return "not_paid"
  if (params.role === "coach") return "full"
  const time = params.startTime && HH_MM_RE.test(params.startTime) ? params.startTime : "00:00"
  const sessionStart = Date.parse(`${params.startDate}T${time}:00Z`)
  if (Number.isNaN(sessionStart)) return "full"
  const cutoff = sessionStart - MIN_NOTICE_HOURS * 60 * 60 * 1000
  return Date.now() <= cutoff ? "full" : "none"
}

function refundNotice(outcome: "full" | "none" | "not_paid", role: Role, totalAmount: number) {
  if (outcome === "not_paid") {
    return "No payment has been taken yet, so there's nothing to refund."
  }
  if (outcome === "none") {
    return `Because this is within ${MIN_NOTICE_HOURS} hours of the session, it's non-refundable — the coach keeps the payment.`
  }
  return role === "coach"
    ? `The renter will be refunded ${formatCents(totalAmount)} in full.`
    : `You'll be refunded ${formatCents(totalAmount)} in full (cancelled with ${MIN_NOTICE_HOURS}h+ notice).`
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

export function CoachCancelDialog({
  bookingId,
  actorRole: role,
  status,
  paymentStatus,
  startDate,
  startTime,
  totalAmount,
  open,
  onOpenChange,
}: Props) {
  const cancel = useMutation(api.coachingBookings.cancel)
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const isPaid = status === "confirmed" && paymentStatus === "paid"
  const outcome = refundOutcome({ role, isPaid, startDate, startTime })
  const notice = refundNotice(outcome, role, totalAmount)

  const handleCancel = async () => {
    setSubmitting(true)
    try {
      await cancel({
        bookingId,
        cancellationReason: reason.trim() || undefined,
      })
      toast.success("Session cancelled")
      onOpenChange(false)
    } catch (err) {
      handleErrorWithContext(err, { action: "cancel coaching session", entity: "booking" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel this coaching session?</DialogTitle>
          <DialogDescription>
            {role === "coach"
              ? "The renter will be notified and refunded per the cancellation policy."
              : "Review the refund policy below before cancelling."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div
            className={
              outcome === "none"
                ? "rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
                : "rounded-lg border bg-muted/40 p-3 text-sm"
            }
          >
            {notice}
          </div>

          {role === "renter" && (
            <p className="text-muted-foreground text-xs">
              Cancellation policy: full refund with {MIN_NOTICE_HOURS}h+ notice before the session;
              within {MIN_NOTICE_HOURS} hours, the session is non-refundable. Coach-initiated
              cancellations are always refunded in full.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason (optional)</Label>
            <Textarea
              id="cancel-reason"
              maxLength={300}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Let the other person know why, if you'd like."
              rows={3}
              value={reason}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} type="button" variant="outline">
            Keep session
          </Button>
          <Button disabled={submitting} onClick={handleCancel} type="button" variant="destructive">
            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Cancel session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
